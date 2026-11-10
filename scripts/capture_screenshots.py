import os
import sys
import time
import subprocess
import threading
import urllib.request
import shutil

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
OUTPUT_DIR = r"C:\innovex\screenshots"
ARTIFACT_DIR = r"C:\Users\HP\.gemini\antigravity\brain\ba01588e-f871-48b9-9d69-c17ad16745f2\screenshots"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
import uvicorn
from app.main import app

def wait_for_url(url, timeout=20):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url) as res:
                if res.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

def capture_page(url, filename):
    out_path = os.path.join(OUTPUT_DIR, filename)
    artifact_path = os.path.join(ARTIFACT_DIR, filename)
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        f"--screenshot={out_path}",
        "--window-size=1280,850",
        "--hide-scrollbars",
        url
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(out_path):
        shutil.copyfile(out_path, artifact_path)
    print(f"Captured {filename} from {url}")

def main():
    # 1. Start Backend in thread on port 8080
    config = uvicorn.Config(app, host='127.0.0.1', port=8080, log_level='error')
    server = uvicorn.Server(config)
    b_thread = threading.Thread(target=server.run, daemon=True)
    b_thread.start()
    
    # 2. Start Frontend Vite Preview
    frontend_dir = r"C:\innovex\frontend"
    f_proc = subprocess.Popen(
        "npx.cmd vite preview --port 5173 --host 127.0.0.1",
        shell=True,
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        print("Waiting for backend on port 8080...")
        if not wait_for_url("http://127.0.0.1:8080/api/health", timeout=15):
            print("Backend failed to respond on 8080")
            return
        print("Backend ready.")

        print("Waiting for frontend on port 5173...")
        if not wait_for_url("http://127.0.0.1:5173/", timeout=15):
            print("Frontend preview failed to respond on 5173")
            return
        print("Frontend ready.")

        time.sleep(2)

        # Capture key pages
        capture_page("http://127.0.0.1:5173/", "01_landing_page.png")
        capture_page("http://127.0.0.1:5173/submit", "02_citizen_submission.png")
        capture_page("http://127.0.0.1:5173/track?id=JS-2026-0001", "03_citizen_tracking.png")
        capture_page("http://127.0.0.1:5173/officer", "04_officer_overview.png")
        capture_page("http://127.0.0.1:5173/officer/complaints", "05_complaints_table.png")
        capture_page("http://127.0.0.1:5173/officer/complaints/1", "06_complaint_detail.png")
        capture_page("http://127.0.0.1:5173/officer/graph", "07_responsibility_graph.png")
        capture_page("http://127.0.0.1:5173/officer/map", "08_geospatial_map.png")
        capture_page("http://127.0.0.1:5173/officer/recurrence", "09_recurrence_monitoring.png")
        capture_page("http://127.0.0.1:5173/officer/admin", "10_admin_rules.png")

        print("All screenshots successfully captured!")
    finally:
        server.should_exit = True
        try:
            f_proc.terminate()
        except Exception:
            pass

if __name__ == "__main__":
    main()
