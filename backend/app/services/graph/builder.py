import math
import networkx as nx
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Complaint, Incident, Department, Ward, RecordedAction, ResolutionEvidence

def build_civic_graph(db: Session, complaint_id_filter: Optional[int] = None) -> Dict[str, Any]:
    """
    Constructs a NetworkX Civic Responsibility Graph dynamically
    from live database records, then computes layout coordinates
    and outputs a React Flow-ready structure.
    """
    G = nx.DiGraph()

    # Query records
    if complaint_id_filter:
        target_complaint = db.query(Complaint).filter(Complaint.id == complaint_id_filter).first()
        if not target_complaint:
            return {"nodes": [], "edges": [], "stats": {}}
        
        # In single-complaint sub-graph mode, include this complaint, its incident,
        # related complaints sharing the same incident, department, ward, and actions
        complaints = [target_complaint]
        if target_complaint.incident_id:
            incident = db.query(Incident).filter(Incident.id == target_complaint.incident_id).first()
            if incident:
                incidents = [incident]
                complaints = db.query(Complaint).filter(Complaint.incident_id == incident.id).all()
            else:
                incidents = []
        else:
            incidents = []
    else:
        # Full graph mode - recent 40 complaints for performance and readability
        complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(40).all()
        incidents = db.query(Incident).limit(20).all()

    # 1. Add Department Nodes
    departments = db.query(Department).all()
    for dept in departments:
        node_id = f"dept-{dept.id}"
        G.add_node(
            node_id,
            node_type="department",
            label=dept.name,
            code=dept.code,
            details=f"SLA: {dept.sla_hours} hrs | Head: {dept.head_officer or 'Admin'}",
            status="Active Jurisdiction"
        )

    # 2. Add Ward Nodes
    wards = db.query(Ward).all()
    for ward in wards:
        node_id = f"ward-{ward.id}"
        G.add_node(
            node_id,
            node_type="ward",
            label=f"Ward {ward.ward_number}: {ward.name}",
            code=f"W-{ward.ward_number}",
            details=f"Zone: {ward.zone} | Center: ({ward.center_lat:.2f}, {ward.center_lng:.2f})",
            status="Municipal Ward"
        )

    # 3. Add Incident Nodes
    for inc in incidents:
        node_id = f"incident-{inc.id}"
        G.add_node(
            node_id,
            node_type="incident",
            label=f"{inc.incident_code}: {inc.category}",
            code=inc.incident_code,
            details=f"{inc.title} ({inc.locality})",
            status=inc.status
        )
        # Incident -> Ward edge
        if inc.ward_id:
            G.add_edge(
                node_id,
                f"ward-{inc.ward_id}",
                relation="OCCURRED_IN_WARD",
                confidence=1.0,
                verification="Verified Jurisdiction"
            )

    # 4. Add Complaint Nodes and Edges
    for c in complaints:
        c_id = f"complaint-{c.id}"
        G.add_node(
            c_id,
            node_type="complaint",
            label=f"{c.complaint_code} ({c.original_language.upper()})",
            code=c.complaint_code,
            details=c.title,
            status=c.status,
            language=c.original_language,
            locality=c.locality,
            category=c.category
        )

        # Complaint -> Incident edge
        if c.incident_id:
            G.add_edge(
                c_id,
                f"incident-{c.incident_id}",
                relation="AGGREGATED_TO_INCIDENT",
                confidence=0.92,
                verification="NLP Cross-Lingual Clustered"
            )

        # Complaint -> Assigned Department edge
        if c.assigned_department_id:
            G.add_edge(
                c_id,
                f"dept-{c.assigned_department_id}",
                relation="ASSIGNED_TO",
                confidence=1.0,
                verification="Officer Verified"
            )
        elif c.recommended_department_id:
            G.add_edge(
                c_id,
                f"dept-{c.recommended_department_id}",
                relation="RECOMMENDED_ROUTING",
                confidence=0.88,
                verification="Rule Engine Suggested"
            )

        # Complaint -> Ward edge
        if c.ward_id:
            G.add_edge(
                c_id,
                f"ward-{c.ward_id}",
                relation="LOCATED_IN",
                confidence=1.0,
                verification="Geo-tagged"
            )

        # 5. Add Recorded Actions
        for act in c.actions:
            act_id = f"action-{act.id}"
            if not G.has_node(act_id):
                G.add_node(
                    act_id,
                    node_type="action",
                    label=f"Action: {act.action_type}",
                    code=f"ACT-{act.id}",
                    details=f"{act.action_description} by {act.officer_name}",
                    status=act.status_after
                )
            G.add_edge(
                c_id,
                act_id,
                relation="ACTION_RECORDED",
                confidence=1.0,
                verification="Officer Logged"
            )
            # Action -> Department
            if act.department_id:
                G.add_edge(
                    act_id,
                    f"dept-{act.department_id}",
                    relation="EXECUTED_BY",
                    confidence=1.0,
                    verification="Official Action"
                )

        # 6. Add Resolution Evidence
        for ev in c.evidence:
            ev_id = f"evidence-{ev.id}"
            if not G.has_node(ev_id):
                G.add_node(
                    ev_id,
                    node_type="evidence",
                    label=f"Evidence: {ev.file_name}",
                    code=f"EV-{ev.id}",
                    details=ev.description or "Civic inspection documentation",
                    status=ev.verification_status
                )
            G.add_edge(
                c_id,
                ev_id,
                relation="SUPPORTED_BY_EVIDENCE",
                confidence=1.0,
                verification=ev.verification_status
            )

    # Calculate layout using NetworkX spring layout or tiered positioning
    try:
        # Layered positions for clean civic hierarchy
        # Departments (top: y=60), Wards (y=180), Incidents (y=320), Complaints (y=460), Actions/Evidence (y=600)
        layer_y = {
            "department": 60,
            "ward": 200,
            "incident": 350,
            "complaint": 500,
            "action": 650,
            "evidence": 650
        }

        nodes_by_type = {}
        for n, attrs in G.nodes(data=True):
            ntype = attrs.get("node_type", "complaint")
            nodes_by_type.setdefault(ntype, []).append(n)

        positions = {}
        for ntype, nlist in nodes_by_type.items():
            count = len(nlist)
            y = layer_y.get(ntype, 400)
            spacing = max(180, 1100 / max(1, count))
            start_x = 100
            for i, n in enumerate(nlist):
                positions[n] = (start_x + i * spacing, y + (i % 2) * 35)

    except Exception:
        positions = {n: (300, 300) for n in G.nodes()}

    # Format nodes for React Flow
    react_nodes = []
    for node_id, attrs in G.nodes(data=True):
        pos = positions.get(node_id, (200, 200))
        react_nodes.append({
            "id": node_id,
            "type": attrs.get("node_type", "complaint"),
            "data": {
                "label": attrs.get("label", node_id),
                "code": attrs.get("code", ""),
                "nodeType": attrs.get("node_type", "complaint"),
                "details": attrs.get("details", ""),
                "status": attrs.get("status", ""),
                "language": attrs.get("language", ""),
                "locality": attrs.get("locality", ""),
                "category": attrs.get("category", "")
            },
            "position": {"x": float(pos[0]), "y": float(pos[1])}
        })

    # Format edges for React Flow
    react_edges = []
    edge_idx = 1
    for u, v, data in G.edges(data=True):
        react_edges.append({
            "id": f"e-{u}-{v}-{edge_idx}",
            "source": u,
            "target": v,
            "label": data.get("relation", "CONNECTED_TO"),
            "data": {
                "relation": data.get("relation", "CONNECTED_TO"),
                "confidence": data.get("confidence", 1.0),
                "verification": data.get("verification", "Automated")
            }
        })
        edge_idx += 1

    stats = {
        "total_nodes": len(react_nodes),
        "total_edges": len(react_edges),
        "departments": len(nodes_by_type.get("department", [])),
        "wards": len(nodes_by_type.get("ward", [])),
        "incidents": len(nodes_by_type.get("incident", [])),
        "complaints": len(nodes_by_type.get("complaint", [])),
        "actions": len(nodes_by_type.get("action", []))
    }

    return {"nodes": react_nodes, "edges": react_edges, "stats": stats}

