import os
import subprocess
import webbrowser
import urllib.request

def run_replay(fastf1, TelemetryReplayEngine, season, round_num, session_name):

    if round_num is None:
        raise ValueError("--round is required for replay")

    if session_name is None:
        raise ValueError("--session is required for replay")

    print("\nLoading session...\n")

    fastf1.Cache.enable_cache("cache")

    session = fastf1.get_session(season, round_num, session_name)
    session.load(laps=True, telemetry=True)

    frontend_dir = "../f1-app/frontend"
    output_dir = os.path.join(frontend_dir, "public")

    os.makedirs(output_dir, exist_ok=True)

    replay_name = f"replay_{season}_{round_num}_{session_name.lower()}.bin"
    output_path = os.path.join(output_dir, replay_name)

    print(f"Output path: {output_path}")

    if os.path.exists(output_path):
        print("Replay file already exists, skipping generation.")
    else:
        print("Preparing replay engine...")
        engine = TelemetryReplayEngine(session)

        print("Exporting raw binary data...")
        engine.export_binary_replay(output_path)

        print(f"\nReplay BIN generated successfully at {output_path}")

    def vite_running():
        try:
            urllib.request.urlopen("http://localhost:5173", timeout=1)
            return True
        except OSError:
            return False
    
    if vite_running():
        print("Vite already running on port 5173")
    else:
        print("Starting Vite dev server...")
        subprocess.Popen(
            ["cmd", "/c", "npm", "run", "dev"],
            cwd=frontend_dir
        )
    
    webbrowser.open(f"http://localhost:5173/?file={replay_name}")