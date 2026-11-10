import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import (
    Base, Department, Ward, JurisdictionRule, Incident, Complaint, RecordedAction, ResolutionEvidence, AuditLog
)
from app.services.nlp.processor import nlp_engine

def seed_database(db: Session, clear_existing: bool = True):
    """
    Seeds comprehensive municipal reference data and at least 23 multilingual
    synthetic complaints in English, Hindi, and Kannada, complete with
    departments, jurisdiction rules, incidents, officer actions, and recurrence alerts.

    If clear_existing is False, checks if records already exist to prevent duplicate records
    and ensure production complaint records are never accidentally deleted.
    """
    if clear_existing:
        # 1. Clear existing data (for explicit demo reset)
        db.query(AuditLog).delete()
        db.query(ResolutionEvidence).delete()
        db.query(RecordedAction).delete()
        db.query(Complaint).delete()
        db.query(Incident).delete()
        db.query(JurisdictionRule).delete()
        db.query(Ward).delete()
        db.query(Department).delete()
        db.commit()
    else:
        # Safe non-destructive check: if complaints exist, skip to prevent duplicate records
        existing_count = db.query(Complaint).count()
        if existing_count > 0:
            return

    # 2. Seed Departments
    depts = [
        Department(
            name="Water Supply & Sewerage Board",
            code="WATER_DEPT",
            description="Responsible for bulk water distribution, pipeline maintenance, tap water quality and pressure.",
            contact_email="water.support@citycivic.gov.in",
            phone="080-22945100",
            head_officer="Er. Rajeshwar Rao (Chief Engineer)",
            sla_hours=24
        ),
        Department(
            name="Public Works Department (Roads & Infrastructure)",
            code="PWD_DEPT",
            description="Responsible for arterial roads, pothole repairs, bridges, footpaths and road resurfacing.",
            contact_email="pwd.civic@citycivic.gov.in",
            phone="080-22945200",
            head_officer="Er. S. Meenakshi (Superintending Engineer)",
            sla_hours=48
        ),
        Department(
            name="Electricity Supply & Street Lighting",
            code="ELEC_DEPT",
            description="Responsible for street light maintenance, distribution transformers, voltage stability and power safety.",
            contact_email="power.grievance@citycivic.gov.in",
            phone="080-22945300",
            head_officer="Er. Anand Murthy (Executive Engineer)",
            sla_hours=12
        ),
        Department(
            name="Solid Waste Management & Sanitation",
            code="SANIT_DEPT",
            description="Responsible for daily door-to-door waste collection, street sweeping, garbage dumping blackspots and composting.",
            contact_email="sanitation@citycivic.gov.in",
            phone="080-22945400",
            head_officer="Dr. Vandana Patil (Joint Commissioner SWM)",
            sla_hours=24
        ),
        Department(
            name="Stormwater Drainage Department",
            code="DRAIN_DEPT",
            description="Responsible for major and minor stormwater drains, silt clearance, culverts and overflow prevention.",
            contact_email="drainage.help@citycivic.gov.in",
            phone="080-22945500",
            head_officer="Er. Mohammed Farooq (Zonal Executive)",
            sla_hours=36
        ),
        Department(
            name="Public Safety & City Vigilance",
            code="SAFETY_DEPT",
            description="Responsible for public safety hazards, stray animal control, encroachment monitoring and night surveillance coordination.",
            contact_email="safety.grievance@citycivic.gov.in",
            phone="080-22945600",
            head_officer="Inspector K. Vijayalakshmi",
            sla_hours=24
        ),
    ]
    db.add_all(depts)
    db.commit()

    dept_map = {d.code: d.id for d in db.query(Department).all()}

    # 3. Seed Wards
    wards_data = [
        Ward(ward_number=101, name="Koramangala Ward", zone="South Zone", center_lat=12.9352, center_lng=77.6245),
        Ward(ward_number=102, name="Indiranagar Ward", zone="East Zone", center_lat=12.9784, center_lng=77.6408),
        Ward(ward_number=103, name="Jayanagar Ward", zone="South Zone", center_lat=12.9308, center_lng=77.5838),
        Ward(ward_number=104, name="Malleshwaram Ward", zone="West Zone", center_lat=13.0031, center_lng=77.5643),
        Ward(ward_number=105, name="Whitefield Ward", zone="Mahadevapura Zone", center_lat=12.9698, center_lng=77.7500),
    ]
    db.add_all(wards_data)
    db.commit()

    ward_map = {w.ward_number: w.id for w in db.query(Ward).all()}

    # 4. Seed Jurisdiction Rules
    rules = [
        JurisdictionRule(
            category="Water Supply",
            primary_department_id=dept_map["WATER_DEPT"],
            supporting_department_id=dept_map["DRAIN_DEPT"],
            rule_description="Primary authority for drinking water pipeline & supply is Water Board."
        ),
        JurisdictionRule(
            category="Roads",
            primary_department_id=dept_map["PWD_DEPT"],
            supporting_department_id=dept_map["ELEC_DEPT"],
            rule_description="Road resurfacing, pothole filling and footpath maintenance under PWD."
        ),
        JurisdictionRule(
            category="Electricity",
            primary_department_id=dept_map["ELEC_DEPT"],
            supporting_department_id=dept_map["SAFETY_DEPT"],
            rule_description="Street lighting and transformer issues under Electricity Supply Department."
        ),
        JurisdictionRule(
            category="Waste Management",
            primary_department_id=dept_map["SANIT_DEPT"],
            supporting_department_id=None,
            rule_description="Garbage clearance and secondary collection points under SWM Department."
        ),
        JurisdictionRule(
            category="Drainage",
            primary_department_id=dept_map["DRAIN_DEPT"],
            supporting_department_id=dept_map["SANIT_DEPT"],
            rule_description="Stormwater drain overflow and desilting under Drainage Department."
        ),
        JurisdictionRule(
            category="Public Safety",
            primary_department_id=dept_map["SAFETY_DEPT"],
            supporting_department_id=dept_map["ELEC_DEPT"],
            rule_description="Pedestrian hazards, uncovered pits and stray hazards under City Safety."
        ),
    ]
    db.add_all(rules)
    db.commit()

    now = datetime.now(timezone.utc)

    # 5. Seed Incidents (Cross-lingual civic clusters)
    inc_water = Incident(
        incident_code="INC-2026-0001",
        title="Major Pipeline Pressure Loss in Koramangala 4th Block",
        category="Water Supply",
        locality="Koramangala 4th Block",
        ward_id=ward_map[101],
        status="Investigating",
        first_reported_at=now - timedelta(days=4),
        last_reported_at=now - timedelta(hours=2)
    )
    inc_road = Incident(
        incident_code="INC-2026-0002",
        title="Dangerous Pothole Cluster on 100ft Road Indiranagar",
        category="Roads",
        locality="100 Feet Road, Indiranagar",
        ward_id=ward_map[102],
        status="Under Repair",
        first_reported_at=now - timedelta(days=5),
        last_reported_at=now - timedelta(days=1)
    )
    inc_waste = Incident(
        incident_code="INC-2026-0003",
        title="Uncollected Garbage Pile near Jayanagar 4th Block Market",
        category="Waste Management",
        locality="Jayanagar 4th Block Market",
        ward_id=ward_map[103],
        status="Action Initiated",
        first_reported_at=now - timedelta(days=3),
        last_reported_at=now - timedelta(hours=6)
    )
    inc_drain = Incident(
        incident_code="INC-2026-0004",
        title="Drainage Overflow on 8th Main Malleshwaram",
        category="Drainage",
        locality="8th Main, Malleshwaram",
        ward_id=ward_map[104],
        status="Investigating",
        first_reported_at=now - timedelta(days=2),
        last_reported_at=now - timedelta(hours=10)
    )
    db.add_all([inc_water, inc_road, inc_waste, inc_drain])
    db.commit()

    # 6. Seed Recorded Actions (Including action on INC-2026-0001 to demonstrate recurrence!)
    act_water = RecordedAction(
        incident_id=inc_water.id,
        department_id=dept_map["WATER_DEPT"],
        officer_name="Insp. Ramesh Kumar",
        officer_id="BWSSB-OFF-402",
        action_type="Inspection & Pressure Valve Adjustment",
        action_description="Inspected distribution valve at sub-station 4B. Pressure regulator recalibrated and recorded for demonstration.",
        action_date=now - timedelta(days=2),
        status_after="Action Taken",
        evidence_url="https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600"
    )
    act_road = RecordedAction(
        incident_id=inc_road.id,
        department_id=dept_map["PWD_DEPT"],
        officer_name="Er. Sandeep Gowda",
        officer_id="PWD-AE-109",
        action_type="Bituminous Cold Mix Patching",
        action_description="Temporary patch repair executed on pothole cluster near signal. Full resurfacing scheduled.",
        action_date=now - timedelta(days=3),
        status_after="Under Repair",
        evidence_url="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600"
    )
    db.add_all([act_water, act_road])
    db.commit()

    # 7. Seed Multilingual Complaints (English, Hindi, Kannada)
    raw_complaints = [
        # Cluster 1: Water Supply (Cross-Lingual Match & Recurrence Demonstration)
        {
            "code": "JS-2026-0001",
            "title": "Low water supply pressure in Koramangala",
            "desc": "There is no proper water supply in our locality. Water is barely trickling for 15 minutes each morning.",
            "lang": "en",
            "cat": "Water Supply",
            "loc": "Koramangala 4th Block",
            "ward": 101,
            "lat": 12.9345, "lng": 77.6250,
            "dept": dept_map["WATER_DEPT"],
            "inc": inc_water.id,
            "status": "Action Taken",
            "created": now - timedelta(days=4)
        },
        {
            "code": "JS-2026-0002",
            "title": "ನೀರು ಸರಿಯಾಗಿ ಬರುತ್ತಿಲ್ಲ (Water supply issue in Kannada)",
            "desc": "ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೀರು ಸರಿಯಾಗಿ ಬರುತ್ತಿಲ್ಲ. ಮೂರು ದಿನಗಳಿಂದ ನಲ್ಲಿಗಳಲ್ಲಿ ನೀರು ಬರುತ್ತಿಲ್ಲ, ದಯವಿಟ್ಟು ಗಮನಿಸಿ.",
            "lang": "kn",
            "cat": "Water Supply",
            "loc": "Koramangala 4th Block",
            "ward": 101,
            "lat": 12.9358, "lng": 77.6262,
            "dept": dept_map["WATER_DEPT"],
            "inc": inc_water.id,
            "status": "Action Taken",
            "created": now - timedelta(days=3)
        },
        {
            "code": "JS-2026-0003",
            "title": "पानी की सप्लाई की गंभीर समस्या (Water supply issue in Hindi)",
            "desc": "हमारे इलाके में पानी की सप्लाई नहीं हो रही है। सुबह केवल 10 मिनट पानी आता है, प्रेशर बिल्कुल नहीं है।",
            "lang": "hi",
            "cat": "Water Supply",
            "loc": "Koramangala 4th Block",
            "ward": 101,
            "lat": 12.9365, "lng": 77.6238,
            "dept": dept_map["WATER_DEPT"],
            "inc": inc_water.id,
            "status": "Action Taken",
            "created": now - timedelta(days=2, hours=10)
        },
        # RECURRENCE TRIGGER COMPLAINT (Submitted AFTER the action was recorded)
        {
            "code": "JS-2026-0004",
            "title": "Recurrent water supply disruption in Koramangala 4th Block",
            "desc": "Even after the recent valve inspection, water pressure has dropped to zero again in 2nd cross residential area. No supply since morning.",
            "lang": "en",
            "cat": "Water Supply",
            "loc": "Koramangala 4th Block",
            "ward": 101,
            "lat": 12.9350, "lng": 77.6240,
            "dept": dept_map["WATER_DEPT"],
            "inc": inc_water.id,
            "status": "Submitted",
            "created": now - timedelta(hours=3)
        },

        # Cluster 2: Roads & Potholes
        {
            "code": "JS-2026-0005",
            "title": "Severe crater and pothole near 100ft road signal",
            "desc": "There is a large pothole near the main road junction causing heavy traffic jams and two-wheeler skids.",
            "lang": "en",
            "cat": "Roads",
            "loc": "100 Feet Road, Indiranagar",
            "ward": 102,
            "lat": 12.9780, "lng": 77.6410,
            "dept": dept_map["PWD_DEPT"],
            "inc": inc_road.id,
            "status": "Under Repair",
            "created": now - timedelta(days=5)
        },
        {
            "code": "JS-2026-0006",
            "title": "ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ (Road pothole Kannada)",
            "desc": "ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ. ವಾಹನ ಸವಾರರು ಬಿದ್ದು ಗಾಯಗೊಳ್ಳುತ್ತಿದ್ದಾರೆ, ತಕ್ಷಣ ಡಾಂಬರೀಕರಣ ಮಾಡಬೇಕಾಗಿದೆ.",
            "lang": "kn",
            "cat": "Roads",
            "loc": "100 Feet Road, Indiranagar",
            "ward": 102,
            "lat": 12.9792, "lng": 77.6415,
            "dept": dept_map["PWD_DEPT"],
            "inc": inc_road.id,
            "status": "Under Repair",
            "created": now - timedelta(days=4)
        },
        {
            "code": "JS-2026-0007",
            "title": "सड़क पर बड़ा गड्ढा और दुर्घटना का खतरा (Road pothole Hindi)",
            "desc": "सड़क पर गहरा गड्ढा है जिससे दुर्घटना का खतरा लगातार बना हुआ है। मुख्य चौराहे पर गाड़ियाँ असंतुलित हो रही हैं।",
            "lang": "hi",
            "cat": "Roads",
            "loc": "100 Feet Road, Indiranagar",
            "ward": 102,
            "lat": 12.9775, "lng": 77.6402,
            "dept": dept_map["PWD_DEPT"],
            "inc": inc_road.id,
            "status": "Under Repair",
            "created": now - timedelta(days=2)
        },

        # Cluster 3: Waste Management
        {
            "code": "JS-2026-0008",
            "title": "Garbage dump accumulating near vegetable market",
            "desc": "Garbage has not been collected for several days. Stench is unbearable and dogs are scattering waste across the road.",
            "lang": "en",
            "cat": "Waste Management",
            "loc": "Jayanagar 4th Block Market",
            "ward": 103,
            "lat": 12.9300, "lng": 77.5840,
            "dept": dept_map["SANIT_DEPT"],
            "inc": inc_waste.id,
            "status": "Under Review",
            "created": now - timedelta(days=3)
        },
        {
            "code": "JS-2026-0009",
            "title": "कचरा कई दिनों से नहीं उठाया गया (Garbage uncollected Hindi)",
            "desc": "हमारे इलाके में कचरा कई दिनों से नहीं उठाया गया है। सड़क किनारे कूड़े का ढेर लग गया है और बदबू फैल रही है।",
            "lang": "hi",
            "cat": "Waste Management",
            "loc": "Jayanagar 4th Block Market",
            "ward": 103,
            "lat": 12.9312, "lng": 77.5845,
            "dept": dept_map["SANIT_DEPT"],
            "inc": inc_waste.id,
            "status": "Under Review",
            "created": now - timedelta(days=2)
        },
        {
            "code": "JS-2026-0010",
            "title": "ಕಸ ಸಂಗ್ರಹಣೆ ಆಗಿಲ್ಲ, ದುರ್ವಾಸನೆ (Garbage uncollected Kannada)",
            "desc": "ಕಸವನ್ನು ಹಲವು ದಿನಗಳಿಂದ ಸಂಗ್ರಹಿಸಿಲ್ಲ, ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ ಮತ್ತು ಪಾದಚಾರಿಗಳಿಗೆ ಓಡಾಡಲು ಕಷ್ಟವಾಗಿದೆ.",
            "lang": "kn",
            "cat": "Waste Management",
            "loc": "Jayanagar 4th Block Market",
            "ward": 103,
            "lat": 12.9295, "lng": 77.5832,
            "dept": dept_map["SANIT_DEPT"],
            "inc": inc_waste.id,
            "status": "Submitted",
            "created": now - timedelta(hours=6)
        },

        # Cluster 4: Drainage Overflow
        {
            "code": "JS-2026-0011",
            "title": "Blocked storm drain overflowing on shopping street",
            "desc": "There is a drainage overflow near the market. Filthy black sewage water is spilling across footpaths.",
            "lang": "en",
            "cat": "Drainage",
            "loc": "8th Main, Malleshwaram",
            "ward": 104,
            "lat": 13.0025, "lng": 77.5640,
            "dept": dept_map["DRAIN_DEPT"],
            "inc": inc_drain.id,
            "status": "Under Review",
            "created": now - timedelta(days=2)
        },
        {
            "code": "JS-2026-0012",
            "title": "ಚರಂಡಿ ನೀರು ರಸ್ತೆಗೆ ಹರಿಯುತ್ತಿದೆ (Drainage overflow Kannada)",
            "desc": "ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಚರಂಡಿ ನೀರು ರಸ್ತೆಗೆ ಹರಿಯುತ್ತಿದೆ. ಒಳಚರಂಡಿ ಪೈಪ್ ಕಟ್ಟಿಕೊಂಡಿದ್ದು ತಕ್ಷಣ ಸ್ವಚ್ಛಗೊಳಿಸಬೇಕು.",
            "lang": "kn",
            "cat": "Drainage",
            "loc": "8th Main, Malleshwaram",
            "ward": 104,
            "lat": 13.0035, "lng": 77.5650,
            "dept": dept_map["DRAIN_DEPT"],
            "inc": inc_drain.id,
            "status": "Under Review",
            "created": now - timedelta(days=1)
        },
        {
            "code": "JS-2026-0013",
            "title": "नाली का गंदा पानी ओवरफ्लो होकर बह रहा है (Drainage overflow Hindi)",
            "desc": "बाजार के पास नाली का गंदा पानी ओवरफ्लो होकर बह रहा है। राहगीरों के लिए रास्ता बंद हो चुका है।",
            "lang": "hi",
            "cat": "Drainage",
            "loc": "8th Main, Malleshwaram",
            "ward": 104,
            "lat": 13.0020, "lng": 77.5635,
            "dept": dept_map["DRAIN_DEPT"],
            "inc": inc_drain.id,
            "status": "Submitted",
            "created": now - timedelta(hours=10)
        },

        # Cluster 5: Electricity & Street Lighting
        {
            "code": "JS-2026-0014",
            "title": "Street lights faulty for entire stretch on ITPL Main Rd",
            "desc": "Street lights are not working for over 500 meters creating total blackout. High risk of accidents at night.",
            "lang": "en",
            "cat": "Electricity",
            "loc": "ITPL Main Road, Whitefield",
            "ward": 105,
            "lat": 12.9705, "lng": 77.7512,
            "dept": dept_map["ELEC_DEPT"],
            "inc": None,
            "status": "Assigned",
            "created": now - timedelta(days=3)
        },
        {
            "code": "JS-2026-0015",
            "title": "स्ट्रीट लाइट खराब और अंधेरा (Street lights off Hindi)",
            "desc": "बस्ती की मुख्य सड़क पर स्ट्रीट लाइट बंद हैं और अंधेरा रहता है। रात को महिलाओं और बच्चों के लिए सुरक्षित नहीं है।",
            "lang": "hi",
            "cat": "Electricity",
            "loc": "ITPL Main Road, Whitefield",
            "ward": 105,
            "lat": 12.9690, "lng": 77.7495,
            "dept": dept_map["ELEC_DEPT"],
            "inc": None,
            "status": "Assigned",
            "created": now - timedelta(days=2)
        },
        {
            "code": "JS-2026-0016",
            "title": "ಬೀದಿ ದೀಪಗಳು ಸರಿಯಾಗಿ ಬೆಳಗುತ್ತಿಲ್ಲ (Street lights Kannada)",
            "desc": "ಬೀದಿ ದೀಪಗಳು ಸರಿಯಾಗಿ ಬೆಳಗುತ್ತಿಲ್ಲ ಮತ್ತು ಕತ್ತಲೆಯಾಗಿದೆ. ವಿದ್ಯುತ್ ಇಲಾಖೆ ತಕ್ಷಣ ಬಲ್ಬ್ ಬದಲಾಯಿಸಬೇಕು.",
            "lang": "kn",
            "cat": "Electricity",
            "loc": "ITPL Main Road, Whitefield",
            "ward": 105,
            "lat": 12.9715, "lng": 77.7525,
            "dept": dept_map["ELEC_DEPT"],
            "inc": None,
            "status": "Submitted",
            "created": now - timedelta(hours=14)
        },

        # Additional Distinct Categories
        {
            "code": "JS-2026-0017",
            "title": "Broken treated drinking water pipeline leaking on footpath",
            "desc": "Drinking water pipeline fractured near bus stop, fresh clean water going to waste on the road since morning.",
            "lang": "en",
            "cat": "Water Supply",
            "loc": "Jayanagar 9th Block",
            "ward": 103,
            "lat": 12.9250, "lng": 77.5890,
            "dept": dept_map["WATER_DEPT"],
            "inc": None,
            "status": "Assigned",
            "created": now - timedelta(days=1)
        },
        {
            "code": "JS-2026-0018",
            "title": "Uncovered deep trench near primary school",
            "desc": "An open electrical cable trench has been left barricaded poorly near the primary school gate. Poses severe hazard.",
            "lang": "en",
            "cat": "Public Safety",
            "loc": "Koramangala 1st Block",
            "ward": 101,
            "lat": 12.9310, "lng": 77.6320,
            "dept": dept_map["SAFETY_DEPT"],
            "inc": None,
            "status": "Under Review",
            "created": now - timedelta(days=2)
        },
        {
            "code": "JS-2026-0019",
            "title": "फुटपाथ पर खुला मैनहोल (Open manhole hazard Hindi)",
            "desc": "फुटपाथ पर खुला सीवर का ढक्कन है, राहगीरों के लिए गंभीर खतरा है। कोई चेतावनी बोर्ड भी नहीं लगाया गया।",
            "lang": "hi",
            "cat": "Public Safety",
            "loc": "Indiranagar Double Road",
            "ward": 102,
            "lat": 12.9750, "lng": 77.6380,
            "dept": dept_map["SAFETY_DEPT"],
            "inc": None,
            "status": "Assigned",
            "created": now - timedelta(days=1)
        },
        {
            "code": "JS-2026-0020",
            "title": "ಅಪಾಯಕಾರಿ ಕಂದಕ ಮುಚ್ಚಿಲ್ಲ (Hazardous open trench Kannada)",
            "desc": "ಕಾಲುದಾರಿಯಲ್ಲಿ ದೊಡ್ಡ ಕಂದಕ ತೆರೆದಿದ್ದು ಯಾವುದೇ ಸೂಚನಾ ಫಲಕವಿಲ್ಲ. ಪಾದಚಾರಿಗಳು ಬೀಳುವ ಸಾಧ್ಯತೆಯಿದೆ.",
            "lang": "kn",
            "cat": "Public Safety",
            "loc": "Malleshwaram 15th Cross",
            "ward": 104,
            "lat": 13.0080, "lng": 77.5680,
            "dept": dept_map["SAFETY_DEPT"],
            "inc": None,
            "status": "Submitted",
            "created": now - timedelta(hours=18)
        },
        {
            "code": "JS-2026-0021",
            "title": "Stray cattle causing hazard on main bus route",
            "desc": "Herd of unattended cattle congregating on bus lane causing heavy congestion during peak hours.",
            "lang": "en",
            "cat": "Public Safety",
            "loc": "Whitefield Post Office Road",
            "ward": 105,
            "lat": 12.9680, "lng": 77.7480,
            "dept": dept_map["SAFETY_DEPT"],
            "inc": None,
            "status": "Resolved",
            "created": now - timedelta(days=6)
        },
        {
            "code": "JS-2026-0022",
            "title": "Daily domestic waste collection truck skipped 5th cross",
            "desc": "Door-to-door sanitation truck has skipped our lane for 3 days consecutively, causing household waste to pile up.",
            "lang": "en",
            "cat": "Waste Management",
            "loc": "Koramangala 3rd Block",
            "ward": 101,
            "lat": 12.9325, "lng": 77.6210,
            "dept": dept_map["SANIT_DEPT"],
            "inc": None,
            "status": "Resolved",
            "created": now - timedelta(days=7)
        },
        {
            "code": "JS-2026-0023",
            "title": "Low water pressure in 2nd cross residential area",
            "desc": "Water supply pressure is insufficient to reach overhead storage tanks. Multiple houses affected.",
            "lang": "en",
            "cat": "Water Supply",
            "loc": "Koramangala 4th Block",
            "ward": 101,
            "lat": 12.9348, "lng": 77.6242,
            "dept": dept_map["WATER_DEPT"],
            "inc": inc_water.id,
            "status": "Submitted",
            "created": now - timedelta(hours=1)
        }
    ]

    for item in raw_complaints:
        emb = nlp_engine.generate_embedding(item["desc"])
        c = Complaint(
            complaint_code=item["code"],
            title=item["title"],
            description=item["desc"],
            original_language=item["lang"],
            category=item["cat"],
            locality=item["loc"],
            ward_id=ward_map[item["ward"]],
            latitude=item["lat"],
            longitude=item["lng"],
            status=item["status"],
            citizen_name="Demo Citizen",
            citizen_phone="9876543210",
            assigned_department_id=item["dept"],
            recommended_department_id=item["dept"],
            routing_reason=f"Standard civic jurisdiction rule for '{item['cat']}'.",
            incident_id=item["inc"],
            embedding_json=json.dumps(emb),
            ai_processing_mode=nlp_engine.processing_mode,
            is_demo_data=True,
            created_at=item["created"],
            updated_at=item["created"]
        )
        db.add(c)
        db.flush()

        # Add audit entry
        audit = AuditLog(
            complaint_id=c.id,
            action_type="Submitted",
            previous_value=None,
            new_value="Submitted",
            performed_by="Jan Setu System",
            notes=f"Synthetic demonstration record initialized for {item['lang'].upper()} language testing.",
            created_at=item["created"]
        )
        db.add(audit)

    db.commit()
    print("Database successfully seeded with comprehensive demo civic data!")

