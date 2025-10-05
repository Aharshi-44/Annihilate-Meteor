# How to Run the Asteroid Defense Simulation Project

## Prerequisites
- Python 3.8+ installed
- Node.js and npm installed
- PowerShell (Windows)

## Backend Setup

1. **Navigate to the backend directory:**
   ```powershell
   cd backend
   ```

2. **Install Python dependencies:**
   ```powershell
   python -m pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```powershell
   uvicorn server:app --host 127.0.0.1 --port 8000
   ```
   
   **Alternative method:**
   ```powershell
   python server.py
   ```

   The server will start on `http://127.0.0.1:8000`

## Frontend Setup

1. **Open a new PowerShell window and navigate to the frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```powershell
   npm install
   ```

3. **Start the frontend development server:**
   ```powershell
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## Important Notes

### PowerShell Syntax
- **Don't use `&&` in PowerShell** - it's not supported in older versions
- Use separate commands instead:
  ```powershell
  cd backend
  python server.py
  ```

### Directory Structure
- Backend server files are in the `backend/` directory
- Frontend files are in the `frontend/` directory
- Always run commands from the correct directory

### Common Issues and Solutions

1. **"Could not import module 'server'" error:**
   - Make sure you're in the `backend/` directory when running uvicorn
   - Use: `cd backend` then `uvicorn server:app --host 127.0.0.1 --port 8000`

2. **"File not found" errors:**
   - Check you're in the correct directory
   - Backend commands should be run from `backend/` folder
   - Frontend commands should be run from `frontend/` folder

3. **Port already in use:**
   - Kill existing Python processes: `Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Stop-Process -Force`
   - Or use a different port: `uvicorn server:app --host 127.0.0.1 --port 8001`

4. **Environment variables:**
   - The backend URL is set to `http://localhost:8000` by default in the frontend
   - If you change the backend port, update the frontend code accordingly

## Testing the Application

1. **Test the backend API directly:**
   ```powershell
   Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/impact/calculate" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"diameter": 100, "velocity": 20000, "density": 2500, "latitude": 40.7128, "longitude": -74.0060}'
   ```

2. **Use the frontend:**
   - Open `http://localhost:3000` in your browser
   - Select a location on the map
   - Set asteroid parameters
   - Click "Calculate Impact"

## Project Structure
```
app-main/
├── backend/
│   ├── server.py          # Main FastAPI server
│   ├── requirements.txt   # Python dependencies
│   └── test_server.py     # Test server (optional)
├── frontend/
│   ├── src/
│   │   └── App.js        # Main React application
│   ├── package.json      # Node.js dependencies
│   └── public/
└── HOW_TO_RUN.md         # This file
```

## Features
- Interactive 3D space visualization
- Map-based impact location selection
- Real-time impact calculations
- Mitigation strategy recommendations
- Environmental impact assessment

