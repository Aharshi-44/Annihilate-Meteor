#!/usr/bin/env python3
"""
AI-Enhanced Asteroid Defense Simulator
Run this script to start both the main server and AI API server
"""

import subprocess
import sys
import time
import os
from threading import Thread

def run_server(script_path, port_name):
    """Run a server script in a separate process"""
    try:
        print(f"Starting {port_name} on port {script_path.split('_')[-1].replace('.py', '')}")
        subprocess.run([sys.executable, script_path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running {port_name}: {e}")
    except KeyboardInterrupt:
        print(f"Stopping {port_name}...")

def main():
    print("🚀 Starting AI-Enhanced Asteroid Defense Simulator")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend/server.py"):
        print("❌ Error: Please run this script from the project root directory")
        sys.exit(1)
    
    # Start AI API server in background
    print("🤖 Starting AI API server on port 5001...")
    ai_thread = Thread(target=run_server, args=("backend/ai_api.py", "AI API"))
    ai_thread.daemon = True
    ai_thread.start()
    
    # Wait a moment for AI server to start
    time.sleep(2)
    
    # Start main server
    print("🌍 Starting main server on port 5000...")
    print("=" * 50)
    print("✅ Both servers are running!")
    print("🌍 Main app: http://localhost:3000")
    print("🤖 AI API: http://localhost:5001")
    print("=" * 50)
    print("Press Ctrl+C to stop both servers")
    
    try:
        run_server("backend/server.py", "Main Server")
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        print("✅ All servers stopped")

if __name__ == "__main__":
    main()
