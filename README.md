# 🛡️ ANNIHILATE-METEOR: Advanced Planetary Defense System

A comprehensive, real-time meteor tracking and planetary defense simulation platform that combines NASA/ESA data integration, AI-powered analysis, and interactive 3D visualizations to help protect Earth from potential meteor impacts.

## 🌟 Project Overview

**ANNIHILATE-METEOR** is a cutting-edge web application that simulates meteor impact scenarios and provides advanced defense strategies. The platform integrates real-time Near-Earth Object (NEO) data from NASA and ESA, performs complex impact calculations, and offers AI-powered defense recommendations.

### Key Features

- 🌍 **Real-time NEO Tracking**: Live data from NASA and ESA APIs
- 💥 **Impact Simulation**: Detailed meteor impact calculations and visualizations
- 🤖 **AI Defense Analysis**: Google Gemini-powered defense strategy recommendations
- 🎮 **Interactive 3D Visualization**: Three.js-powered Earth impact simulations
- 🗺️ **Interactive Maps**: Leaflet-based global impact zone mapping
- 📊 **Scientific Calculations**: Advanced physics-based impact modeling
- 🎯 **Defense Strategies**: Multiple mitigation approaches (Kinetic Impactor, Gravity Tractor, Nuclear Device)

## 🏗️ Architecture

The project follows a modern full-stack architecture with separate frontend and backend services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Main Backend  │    │   AI API Server │
│   (React)       │◄──►│   (FastAPI)     │    │   (Flask)       │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   MongoDB        │    │   Google Gemini │
│   - 3D Earth    │    │   Database       │    │   AI API        │
│   - Maps        │    │   - NEO Data     │    │                 │
│   - Charts      │    │   - Impact Data  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Three.js** - 3D graphics and Earth visualization
- **Leaflet** - Interactive mapping
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Axios** - HTTP client for API communication

### Backend Services

#### Main Backend (FastAPI)
- **FastAPI** - High-performance web framework
- **MongoDB** - NoSQL database for NEO and impact data
- **Motor** - Async MongoDB driver
- **NumPy/SciPy** - Scientific calculations
- **aiohttp** - Async HTTP client for external APIs

#### AI API Server (Flask)
- **Flask** - Lightweight web framework
- **Google Generative AI** - Gemini model integration
- **Flask-CORS** - Cross-origin resource sharing

### External APIs
- **NASA NEO API** - Near-Earth Object data
- **ESA NEOCC** - European Space Agency NEO data
- **Google Gemini API** - AI-powered analysis

## 📁 Project Structure

```
app-main/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── App.js           # Main application component
│   │   ├── App.css          # Global styles and animations
│   │   ├── components/      # Reusable UI components
│   │   │   ├── EarthImpact3D.jsx    # 3D Earth visualization
│   │   │   ├── GameSaveEarth.jsx    # Interactive game component
│   │   │   └── ui/          # Radix UI components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Backend services
│   ├── server.py            # Main FastAPI server
│   ├── ai_api.py            # AI API Flask server
│   ├── requirements.txt     # Python dependencies
│   └── test_server.py       # Server testing utilities
├── tests/                   # Test files
└── README.md               # This file
```

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Google Gemini API Key** (for AI features)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd app-main
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
# Database Configuration
MONGODB_URL=mongodb://localhost:27017
DB_NAME=asteroid_defense

# API Keys
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_AI_API_URL=http://localhost:5001
```

## 🚀 Running the Application

### Start All Services

#### 1. Start MongoDB
```bash
# If using local MongoDB
mongod
```

#### 2. Start Main Backend Server
```bash
cd backend
python server.py
```
Server will run on: `http://localhost:8000`

#### 3. Start AI API Server
```bash
cd backend
python ai_api.py
```
AI API will run on: `http://localhost:5001`

#### 4. Start Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

### Access Points
- **Frontend Application**: http://localhost:3000
- **Main API Documentation**: http://localhost:8000/docs
- **AI API Health Check**: http://localhost:5001/api/health

## 🎯 Core Features Deep Dive

### 1. Real-time NEO Tracking

The system continuously fetches and processes Near-Earth Object data from multiple sources:

#### Data Sources
- **NASA NEO API**: Primary source for NEO orbital data
- **ESA NEOCC**: European Space Agency's Near-Earth Object Coordination Centre
- **Fallback Data**: Cached data when external APIs are unavailable

#### Data Processing Pipeline
```python
# Simplified data flow
External APIs → Data Validation → MongoDB Storage → Real-time Updates → Frontend Display
```

#### Key Data Points
- Object diameter and mass
- Orbital parameters (velocity, trajectory)
- Close approach dates and distances
- Hazard classification (Potentially Hazardous Objects)

### 2. Impact Simulation Engine

The platform performs sophisticated physics-based calculations to simulate meteor impacts:

#### Calculation Components
- **Kinetic Energy**: `KE = 0.5 * m * v²`
- **TNT Equivalent**: Energy conversion for comparison
- **Crater Formation**: Diameter and depth calculations
- **Environmental Effects**: Dust injection, climate impact
- **Seismic Magnitude**: Earthquake equivalent calculations

#### Impact Zones
- **Fireball Radius**: Immediate thermal effects
- **Shockwave**: Air blast damage radius
- **Thermal Radiation**: Heat damage zone
- **Seismic Effects**: Ground shaking radius

### 3. AI-Powered Defense Analysis

The system uses Google's Gemini AI to provide intelligent defense recommendations:

#### AI Analysis Process
1. **Data Input**: Impact parameters, object characteristics
2. **Strategy Evaluation**: Analysis of three main defense methods
3. **Recommendation Generation**: Detailed scientific explanations
4. **Risk Assessment**: Probability of success calculations

#### Defense Strategies Analyzed
- **Kinetic Impactor**: Direct collision to alter trajectory
- **Gravity Tractor**: Long-term gravitational influence
- **Nuclear Device**: Explosive deflection (last resort)

### 4. Interactive 3D Visualization

The frontend provides immersive 3D experiences using Three.js:

#### 3D Earth Component
- Realistic Earth model with textures
- Dynamic lighting and atmospheric effects
- Interactive camera controls
- Real-time impact visualization

#### Impact Simulation Features
- Animated meteor approach
- Explosion effects with particle systems
- Shockwave propagation visualization
- Damage zone overlays

### 5. Interactive Mapping System

Leaflet-based mapping provides detailed geographical context:

#### Map Features
- **Global View**: World map with impact zones
- **Zoom Controls**: Detailed regional analysis
- **Population Data**: Overlay demographic information
- **Impact Markers**: Visual representation of potential impacts

## 🔌 API Endpoints

### Main Backend API (Port 8000)

#### NEO Data Endpoints
- `GET /api/neo/current` - Get current NEO data
- `POST /api/neo/search` - Search NEOs with filters
- `GET /api/neo/historical` - Historical impact data
- `GET /api/neo/stats` - NEO statistics

#### Impact Simulation Endpoints
- `POST /api/impact/calculate` - Calculate impact scenario
- `POST /api/impact/simulate-historical/{id}` - Simulate historical impact

#### Mitigation Endpoints
- `POST /api/mitigation/strategies` - Get defense strategies
- `POST /api/mitigation/simulate` - Simulate mitigation attempt

### AI API Endpoints (Port 5001)

#### AI Analysis
- `POST /api/defense-analysis` - Generate AI defense analysis
- `POST /api/ai-chat` - Interactive AI chat
- `GET /api/health` - Health check

## 🎮 User Interface Components

### Main Dashboard
- **Real-time NEO Counter**: Live count of tracked objects
- **Threat Level Indicator**: Visual threat assessment
- **Quick Actions**: Access to key features

### Impact Simulator
- **Parameter Input**: Meteor characteristics (diameter, velocity, composition)
- **Location Selection**: Interactive map for impact site
- **Real-time Calculation**: Instant impact analysis
- **Visual Results**: Charts and graphs

### Defense Analysis Panel
- **AI Recommendations**: Detailed defense strategies
- **Strategy Comparison**: Side-by-side analysis
- **Success Probability**: Risk assessment metrics
- **Implementation Timeline**: Phased approach planning

### 3D Visualization
- **Interactive Earth**: Rotate, zoom, and explore
- **Impact Animation**: Step-by-step impact simulation
- **Damage Visualization**: Color-coded effect zones
- **Camera Controls**: Multiple viewing angles

## 🔒 Security & Performance

### Security Measures
- **API Key Management**: Secure storage of external API keys
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Pydantic models for data validation
- **Error Handling**: Comprehensive error management

### Performance Optimizations
- **Database Indexing**: Optimized MongoDB queries
- **Caching Strategy**: Redis-like caching for NEO data
- **Async Operations**: Non-blocking I/O operations
- **Frontend Optimization**: Code splitting and lazy loading

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
```bash
# Test main backend
curl http://localhost:8000/api/neo/stats

# Test AI API
curl http://localhost:5001/api/health
```

## 🚀 Deployment

### Production Deployment

#### Backend Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up MongoDB cluster
3. **Server**: Deploy using Gunicorn or similar WSGI server
4. **Load Balancing**: Configure reverse proxy (Nginx)

#### Frontend Deployment
1. **Build**: `npm run build`
2. **Static Hosting**: Deploy to CDN or static hosting service
3. **Environment**: Configure production API URLs

### Docker Deployment
```dockerfile
# Example Dockerfile for backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "server.py"]
```

## 📊 Monitoring & Analytics

### Application Monitoring
- **Health Checks**: Regular API endpoint monitoring
- **Performance Metrics**: Response time tracking
- **Error Logging**: Comprehensive error tracking
- **Usage Analytics**: User interaction tracking

### Data Analytics
- **NEO Tracking**: Object detection and classification
- **Impact Frequency**: Historical impact analysis
- **Defense Effectiveness**: Strategy success rates
- **User Engagement**: Feature usage statistics

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript
2. **Testing**: Write tests for new features
3. **Documentation**: Update README and code comments
4. **Version Control**: Use semantic versioning

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📚 Additional Resources

### Scientific References
- [NASA NEO Program](https://www.nasa.gov/planetarydefense/neocp)
- [ESA NEO Coordination Centre](https://neo.ssa.esa.int/)
- [Planetary Defense Conference](https://pdc.iaaweb.org/)

### Technical Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Three.js Documentation](https://threejs.org/docs/)

## 🐛 Troubleshooting

### Common Issues

#### Backend Server Won't Start
```bash
# Check if port 8000 is available
netstat -an | findstr :8000

# Kill process using the port
taskkill /PID <process_id> /F
```

#### AI API Connection Issues
```bash
# Verify AI API server is running
curl http://localhost:5001/api/health

# Check Google Gemini API key
echo $GOOGLE_GEMINI_API_KEY
```

#### Frontend Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error Codes
- **500**: Internal server error - Check server logs
- **404**: Endpoint not found - Verify API routes
- **403**: Forbidden - Check API key configuration
- **CORS**: Cross-origin error - Verify CORS settings

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NASA** for providing NEO data and scientific guidance
- **ESA** for NEOCC data and European perspective
- **Google** for Gemini AI capabilities
- **Open Source Community** for the amazing libraries and frameworks

## 📞 Support

For support, questions, or contributions:
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

---

**🛡️ Protecting Earth, One Meteor at a Time** 🛡️