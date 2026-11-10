import sys
import os
import threading
import time
import urllib.request
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import uvicorn
from app.main import app

def check(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    with urllib.request.urlopen(req, data=body) as res:
        val = json.loads(res.read().decode())
        return res.status, val

def main():
    config = uvicorn.Config(app, host='127.0.0.1', port=8008, log_level='error')
    server = uvicorn.Server(config)
    t = threading.Thread(target=server.run, daemon=True)
    t.start()
    time.sleep(3)

    try:
        print("1. Health Endpoint:", check('http://127.0.0.1:8008/api/health')[1])
        print("2. Summary Endpoint:", check('http://127.0.0.1:8008/api/dashboard/summary')[1])
        
        # Complaints list
        st, comps = check('http://127.0.0.1:8008/api/complaints')
        print(f"3. Complaints List Count: {len(comps)}")
        
        # Detail
        first_id = comps[0]['id']
        st, detail = check(f'http://127.0.0.1:8008/api/complaints/{first_id}')
        print(f"4. Detail Code: {detail['complaint_code']}, Related Count: {len(detail['related_complaints'])}")
        if detail['related_complaints']:
            top_rel = detail['related_complaints'][0]
            print(f"   Top Related Match: {top_rel['complaint_code']} ({top_rel['original_language']}), Similarity Score: {top_rel['similarity_score']}")
            
        # Recurrence alerts
        st, alerts = check('http://127.0.0.1:8008/api/recurrence')
        print(f"5. Recurrence Alerts Count: {len(alerts)}")
        if alerts:
            print(f"   Alert [0]: {alerts[0]['alert_message']}")

        # Responsibility Graph
        st, graph = check('http://127.0.0.1:8008/api/graph')
        print(f"6. Responsibility Graph: Nodes={len(graph['nodes'])}, Edges={len(graph['edges'])}")
        
        # Ward GeoJSON
        st, geo = check('http://127.0.0.1:8008/api/wards/geojson')
        print(f"7. Ward Boundary GeoJSON Polygons: {len(geo.get('features', []))}")

        # Test multilingual submission in Kannada
        payload_kn = {
            "title": "ನೀರು ಸರಬರಾಜು ಸಮಸ್ಯೆ ಪರೀಕ್ಷೆ",
            "description": "ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೀರು ಸರಿಯಾಗಿ ಬರುತ್ತಿಲ್ಲ, ದಯವಿಟ್ಟು ಗಮನಿಸಿ.",
            "original_language": "kn",
            "category": "Water Supply",
            "locality": "Koramangala 4th Block",
            "ward_id": 1
        }
        st, res_kn = check('http://127.0.0.1:8008/api/complaints', method='POST', data=payload_kn)
        print(f"8. Multilingual Submission (Kannada): {res_kn['complaint_code']}, Status: {res_kn['status']}")
        print(f"   Recommended Department: {res_kn['recommended_department_name']}")

        # Test multilingual submission in Hindi
        payload_hi = {
            "title": "पानी की सप्लाई की जांच",
            "description": "हमारे इलाके में पानी की सप्लाई नहीं हो रही है, प्रेशर बहुत कम है।",
            "original_language": "hi",
            "category": "Water Supply",
            "locality": "Koramangala 4th Block",
            "ward_id": 1
        }
        st, res_hi = check('http://127.0.0.1:8008/api/complaints', method='POST', data=payload_hi)
        print(f"9. Multilingual Submission (Hindi): {res_hi['complaint_code']}, Status: {res_hi['status']}")

        print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
    finally:
        server.should_exit = True

if __name__ == "__main__":
    main()

