import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

def test_dashboard_summary():
    with TestClient(app) as client:
        response = client.get("/api/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["total_complaints"] >= 20
        assert data["pending_complaints"] >= 1
        assert data["related_complaint_groups"] >= 1
        assert data["recurrence_alerts"] >= 1

def test_multilingual_complaint_submission():
    with TestClient(app) as client:
        # 1. English Submission
        payload_en = {
            "title": "Low water pressure in test block",
            "description": "There is no proper water supply in our locality since yesterday.",
            "original_language": "en",
            "category": "Water Supply",
            "locality": "Koramangala 4th Block",
            "ward_id": 1,
            "citizen_name": "Test Citizen",
            "citizen_phone": "9998887776"
        }
        res_en = client.post("/api/complaints", json=payload_en)
        assert res_en.status_code == 200
        data_en = res_en.json()
        assert data_en["complaint_code"].startswith("JS-2026-")
        assert data_en["status"] == "Submitted"
        assert "Water" in data_en["recommended_department_name"]

        # 2. Kannada Submission
        payload_kn = {
            "title": "ನೀರು ಸರಬರಾಜು ಸಮಸ್ಯೆ",
            "description": "ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೀರು ಸರಿಯಾಗಿ ಬರುತ್ತಿಲ್ಲ, ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
            "original_language": "kn",
            "category": "Water Supply",
            "locality": "Koramangala 4th Block",
            "ward_id": 1
        }
        res_kn = client.post("/api/complaints", json=payload_kn)
        assert res_kn.status_code == 200
        data_kn = res_kn.json()
        assert data_kn["original_language"] == "kn"
        assert len(data_kn["related_complaints"]) > 0

        # 3. Hindi Submission
        payload_hi = {
            "title": "पानी की समस्या",
            "description": "हमारे इलाके में पानी की सप्लाई नहीं हो रही है, बहुत परेशानी है।",
            "original_language": "hi",
            "category": "Water Supply",
            "locality": "Koramangala 4th Block",
            "ward_id": 1
        }
        res_hi = client.post("/api/complaints", json=payload_hi)
        assert res_hi.status_code == 200
        data_hi = res_hi.json()
        assert data_hi["original_language"] == "hi"

def test_officer_assignment_and_action():
    with TestClient(app) as client:
        # Submit a complaint to test officer workflow
        payload = {
            "title": "Open pothole near road junction",
            "description": "Large pothole on road causing traffic risk.",
            "original_language": "en",
            "category": "Roads",
            "locality": "Indiranagar",
            "ward_id": 2
        }
        res = client.post("/api/complaints", json=payload)
        complaint_id = res.json()["id"]

        # Accept / assign department
        assign_payload = {
            "department_id": 2, # PWD
            "officer_name": "Er. Officer Testing",
            "officer_notes": "Assigned to road maintenance division."
        }
        res_assign = client.post(f"/api/complaints/{complaint_id}/assign", json=assign_payload)
        assert res_assign.status_code == 200

        # Record action
        action_payload = {
            "department_id": 2,
            "officer_name": "Er. Officer Testing",
            "officer_id": "OFF-101",
            "action_type": "Road Surface Patching",
            "action_description": "Cold mix asphalt applied to fill cavity.",
            "status_after": "Action Taken"
        }
        res_action = client.post(f"/api/complaints/{complaint_id}/action", json=action_payload)
        assert res_action.status_code == 200
        assert res_action.json()["complaint_status"] == "Action Taken"

def test_recurrence_detection():
    with TestClient(app) as client:
        response = client.get("/api/recurrence")
        assert response.status_code == 200
        alerts = response.json()
        assert len(alerts) >= 1
        alert = alerts[0]
        assert "Potential Recurrence Detected" in alert["alert_message"]
        assert alert["previous_action_description"] is not None

def test_graph_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/graph")
        assert response.status_code == 200
        graph = response.json()
        assert "nodes" in graph
        assert "edges" in graph
        assert len(graph["nodes"]) > 0
        assert len(graph["edges"]) > 0

def test_resolve_complaint():
    with TestClient(app) as client:
        # Submit complaint
        payload = {
            "title": "Broken street light near park",
            "description": "Streetlight pole flickering and not working at night.",
            "original_language": "en",
            "category": "Electricity",
            "locality": "Indiranagar",
            "ward_id": 2
        }
        res = client.post("/api/complaints", json=payload)
        complaint_id = res.json()["id"]

        # Resolve complaint
        resolve_payload = {
            "officer_name": "Er. S. Meenakshi",
            "resolution_notes": "Replaced faulty capacitor and LED luminaire.",
            "evidence_url": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"
        }
        res_res = client.post(f"/api/complaints/{complaint_id}/resolve", json=resolve_payload)
        assert res_res.status_code == 200
        assert res_res.json()["complaint_status"] == "Resolved"

        # Check detail reflects the recorded action and evidence
        detail_res = client.get(f"/api/complaints/{complaint_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert detail["status"] == "Resolved"
        assert len(detail["actions"]) > 0
        assert detail["actions"][0]["action_type"] == "Resolution Completed"
        assert len(detail["evidence"]) > 0

def test_complaint_status_update():
    with TestClient(app) as client:
        # Submit complaint
        payload = {
            "title": "Garbage dump near community hall",
            "description": "Heavy garbage accumulation attracting strays.",
            "original_language": "en",
            "category": "Waste Management",
            "locality": "Malleshwaram",
            "ward_id": 3
        }
        res = client.post("/api/complaints", json=payload)
        complaint_id = res.json()["id"]

        patch_res = client.patch(
            f"/api/complaints/{complaint_id}/status",
            json={"status": "Under Review", "officer_name": "Supervisor Kumar", "officer_notes": "Site inspection scheduled."}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["complaint_status"] == "Under Review"
