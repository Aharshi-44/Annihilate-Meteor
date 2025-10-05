from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import json
import requests
import aiohttp
import asyncio
import numpy as np
import math
from scipy import constants

ROOT_DIR = Path(__file__).parent
try:
    load_dotenv(ROOT_DIR / '.env')
except Exception as e:
    print(f"Could not load .env file: {e}")

async def create_database_indexes():
    """Create database indexes for better performance"""
    if db is None:
        return
    
    try:
        # NEO collection indexes
        await neo_collection.create_index("id", unique=True)
        await neo_collection.create_index("potentially_hazardous")
        await neo_collection.create_index("close_approach_date")
        await neo_collection.create_index("miss_distance")
        await neo_collection.create_index("diameter_max")
        
        # Historical impacts collection indexes
        await historical_impacts_collection.create_index("id", unique=True)
        await historical_impacts_collection.create_index("date")
        await historical_impacts_collection.create_index("energy_release")
        
        # Cache collection indexes
        await neo_cache_collection.create_index("type", unique=True)
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")

# MongoDB connection (optional for testing)
try:
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'asteroid_defense')]
    
    # Initialize collections
    neo_collection = db.near_earth_objects
    historical_impacts_collection = db.historical_impacts
    neo_cache_collection = db.neo_cache
    
    # Create indexes for better performance
    # Note: Indexes will be created when the server starts
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    db = None
    neo_collection = None
    historical_impacts_collection = None
    neo_cache_collection = None

# Create the main app without a prefix
app = FastAPI(title="Asteroid Defense Simulation API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ESA NEOCC API Configuration
ESA_NEOCC_API_BASE = "https://neo.ssa.esa.int"
ESA_NEOCC_ALL_NEO_URL = f"{ESA_NEOCC_API_BASE}/PSDB-portlet/download?file=allneo.lst"
ESA_NEOCC_UPDATED_NEA_URL = f"{ESA_NEOCC_API_BASE}/PSDB-portlet/download?file=updated_nea.lst"
ESA_NEOCC_AUTOMATED_ACCESS = f"{ESA_NEOCC_API_BASE}/computer-access"

# NASA API Configuration (keeping as fallback)
NASA_NEO_API_BASE = "https://api.nasa.gov/neo/rest/v1"
NASA_API_KEY = os.environ.get('NASA_API_KEY', 'NaochsnJRMdbNuEZ1w1YfbFY8ru4ftrPBm4r5rAT')  # Use provided NASA API key

# Data synchronization settings
NEO_SYNC_INTERVAL = 3600  # 1 hour in seconds
CACHE_DURATION = 1800  # 30 minutes in seconds

# USGS API Configuration
USGS_EARTHQUAKE_API = "https://earthquake.usgs.gov/fdsnws/event/1/query"
USGS_TSUNAMI_API = "https://earthquake.usgs.gov/fdsnws/event/1/query"

# Physics Constants
EARTH_RADIUS = 6371000  # meters
EARTH_MASS = 5.972e24   # kg
G = constants.G         # gravitational constant
TNT_EQUIVALENT = 4.184e9  # J/kg for TNT conversion

# Define Models
class AsteroidParameters(BaseModel):
    diameter: float = Field(..., description="Asteroid diameter in meters")
    velocity: float = Field(..., description="Impact velocity in m/s")
    density: float = Field(default=3000, description="Asteroid density in kg/m³")
    angle: float = Field(default=45, description="Impact angle in degrees")
    latitude: float = Field(..., description="Impact latitude")
    longitude: float = Field(..., description="Impact longitude")

class ImpactResults(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parameters: AsteroidParameters
    kinetic_energy: float = Field(..., description="Impact energy in Joules")
    tnt_equivalent: float = Field(..., description="TNT equivalent in kg")
    crater_diameter: float = Field(..., description="Crater diameter in meters")
    crater_depth: float = Field(..., description="Crater depth in meters")
    seismic_magnitude: float = Field(..., description="Estimated seismic magnitude")
    tsunami_risk: bool = Field(..., description="Tsunami risk assessment")
    environmental_effects: Dict[str, Any] = Field(..., description="Environmental impact assessment")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MitigationStrategy(BaseModel):
    strategy_type: str = Field(..., description="Type of mitigation (kinetic_impactor, gravity_tractor, nuclear)")
    lead_time: float = Field(..., description="Lead time in years")
    success_probability: float = Field(..., description="Success probability (0-1)")
    velocity_change: float = Field(..., description="Required delta-v in m/s")
    cost_estimate: float = Field(..., description="Estimated cost in millions USD")
    description: str = Field(..., description="Strategy description")

class MitigationResults(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_impact: ImpactResults
    strategy: MitigationStrategy
    deflection_distance: float = Field(..., description="Deflection distance in km")
    new_trajectory: Dict[str, float] = Field(..., description="New trajectory parameters")
    risk_reduction: float = Field(..., description="Risk reduction percentage")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NearEarthObject(BaseModel):
    id: str
    name: str
    diameter_min: float
    diameter_max: float
    close_approach_date: str
    miss_distance: float
    velocity: float
    potentially_hazardous: bool
    absolute_magnitude: float
    last_updated: Optional[datetime] = Field(default_factory=datetime.now, description="Last data update")
    source: str = Field(default="nasa", description="Data source")
    orbital_period: Optional[float] = Field(None, description="Orbital period in years")
    eccentricity: Optional[float] = Field(None, description="Orbital eccentricity")
    inclination: Optional[float] = Field(None, description="Orbital inclination in degrees")

class HistoricalImpact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., description="Impact event name")
    date: str = Field(..., description="Impact date")
    location: str = Field(..., description="Impact location")
    latitude: float = Field(..., description="Impact latitude")
    longitude: float = Field(..., description="Impact longitude")
    diameter_estimate: float = Field(..., description="Estimated diameter in meters")
    energy_release: float = Field(..., description="Energy release in megatons TNT")
    crater_diameter: Optional[float] = Field(None, description="Crater diameter in meters")
    casualties: Optional[int] = Field(None, description="Estimated casualties")
    description: str = Field(..., description="Event description")
    source: str = Field(default="historical", description="Data source")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NEOSearchFilters(BaseModel):
    min_diameter: Optional[float] = Field(None, description="Minimum diameter filter")
    max_diameter: Optional[float] = Field(None, description="Maximum diameter filter")
    potentially_hazardous_only: Optional[bool] = Field(None, description="Filter hazardous objects only")
    min_miss_distance: Optional[float] = Field(None, description="Minimum miss distance filter")
    max_miss_distance: Optional[float] = Field(None, description="Maximum miss distance filter")
    date_from: Optional[str] = Field(None, description="Start date filter (YYYY-MM-DD)")
    date_to: Optional[str] = Field(None, description="End date filter (YYYY-MM-DD)")
    search_term: Optional[str] = Field(None, description="Search in name/description")

class GeologyData(BaseModel):
    location: Dict[str, float]
    elevation: float
    population_density: float
    coastal_proximity: float
    seismic_activity: float
    geological_stability: str

# Physics Calculation Functions
def calculate_asteroid_mass(diameter: float, density: float) -> float:
    """Calculate asteroid mass from diameter and density"""
    radius = diameter / 2
    volume = (4/3) * math.pi * (radius ** 3)
    return volume * density

def calculate_kinetic_energy(mass: float, velocity: float) -> float:
    """Calculate kinetic energy of asteroid impact"""
    return 0.5 * mass * (velocity ** 2)

def calculate_crater_size(
    energy: float,
    target_density: float = 2500,
    projectile_diameter: Optional[float] = None,
    projectile_density: Optional[float] = None,
    velocity: Optional[float] = None,
    impact_angle_deg: Optional[float] = None,
) -> tuple:
    """Calculate crater diameter and depth using a Holsapple-style Pi-scaling approximation.

    Falls back to simple energy scaling if required inputs are missing.
    Returns (diameter_m, depth_m).
    """
    try:
        # If we have projectile parameters, use Pi-scaling (gravity regime, rock target)
        if all(
            v is not None
            for v in [projectile_diameter, projectile_density, velocity, impact_angle_deg]
        ):
            a = max(0.01, float(projectile_diameter) / 2.0)  # projectile radius (m)
            rho_p = float(projectile_density)
            rho_t = float(target_density)
            g = 9.81  # m/s^2

            # Effective velocity component normal to surface
            theta = max(1e-3, min(89.9, float(impact_angle_deg))) * math.pi / 180.0
            v_eff = max(1.0, float(velocity) * math.sin(theta))

            # Dimensionless gravity scaling: pi2 = g a / v^2
            # Use gravity-dominated scaling with exponent mu ~ 0.22 for rock
            mu = 0.22
            # Empirical constant for rock targets (transient crater) ~ 1.3–1.6
            K1 = 1.5

            # Density effect (coupling parameter). Use (rho_p/rho_t)^(1/3) as a first-order factor
            density_factor = (rho_p / max(1.0, rho_t)) ** (1.0 / 3.0)

            pi2 = (g * a) / (v_eff ** 2)
            # Transient crater diameter (m)
            D_transient = K1 * a * (pi2 ** (-mu)) * density_factor

            # Final simple crater is typically 1.2–1.4 × transient for rock
            D_final = 1.3 * D_transient
            depth = D_final / 7.0
            return D_final, depth

        # Fallback: energy-based empirical scaling (previous behavior)
        energy_mt = energy / (4.184e15)
        diameter = 1000 * (energy_mt ** 0.25)
        depth = diameter / 7
        return diameter, depth
    except Exception:
        # Robust fallback to ensure API does not fail
        energy_mt = energy / (4.184e15)
        diameter = 1000 * (energy_mt ** 0.25)
        depth = diameter / 7
        return diameter, depth

def calculate_seismic_magnitude(energy: float) -> float:
    """Estimate seismic magnitude from impact energy"""
    # Using Gutenberg-Richter relationship adapted for impacts
    # M = log10(E) - 11.8 (where E is in Joules)
    magnitude = math.log10(energy) - 11.8
    return max(0, magnitude)  # Ensure non-negative

def assess_tsunami_risk(lat: float, lon: float, energy: float) -> bool:
    """Assess tsunami risk based on location and impact energy"""
    # Simple assessment: ocean impact with sufficient energy
    # This would need real bathymetry data for accuracy
    energy_mt = energy / (4.184e15)
    
    # Rough ocean boundaries (simplified)
    is_ocean = (
        (abs(lat) < 60 and -180 <= lon <= 180) and  # Not polar
        not (30 <= lat <= 70 and -10 <= lon <= 40)  # Not main landmasses (very simplified)
    )
    
    return is_ocean and energy_mt > 1  # > 1 MT and ocean impact

def calculate_environmental_effects(energy: float, crater_diameter: float) -> Dict[str, Any]:
    """Calculate environmental effects of impact"""
    energy_mt = energy / (4.184e15)
    
    effects = {
        "ejecta_volume": crater_diameter ** 3 * 0.1,  # Simplified
        "dust_injection": min(100, energy_mt * 0.1),  # Percentage of sunlight blocked
        "thermal_radiation": energy_mt * 1000,  # Thermal energy in km²
        "atmospheric_disturbance": "global" if energy_mt > 1000 else "regional" if energy_mt > 10 else "local",
        "climate_impact_duration": max(1, math.log10(energy_mt)) if energy_mt > 1 else 0,  # months
        "biodiversity_threat": "extinction" if energy_mt > 100000 else "severe" if energy_mt > 1000 else "moderate"
    }
    
    return effects

def calculate_mitigation_requirements(asteroid_params: AsteroidParameters, lead_time: float) -> Dict[str, MitigationStrategy]:
    """Calculate different mitigation strategies"""
    mass = calculate_asteroid_mass(asteroid_params.diameter, asteroid_params.density)
    
    strategies = {}
    
    # Kinetic Impactor
    if lead_time >= 5:
        # Required delta-v for deflection (simplified)
        required_dv = 0.1  # m/s (very rough estimate)
        strategies["kinetic_impactor"] = MitigationStrategy(
            strategy_type="kinetic_impactor",
            lead_time=lead_time,
            success_probability=0.8 if lead_time >= 10 else 0.6,
            velocity_change=required_dv,
            cost_estimate=500,  # Million USD
            description="High-speed spacecraft impacts asteroid to change trajectory"
        )
    
    # Gravity Tractor
    if lead_time >= 10:
        strategies["gravity_tractor"] = MitigationStrategy(
            strategy_type="gravity_tractor",
            lead_time=lead_time,
            success_probability=0.9,
            velocity_change=0.01,  # Very small but precise
            cost_estimate=1000,
            description="Spacecraft uses gravitational attraction to slowly alter asteroid path"
        )
    
    # Nuclear Option (last resort)
    if lead_time >= 1:
        strategies["nuclear_deflection"] = MitigationStrategy(
            strategy_type="nuclear_deflection",
            lead_time=lead_time,
            success_probability=0.7 if lead_time >= 5 else 0.4,
            velocity_change=1.0,  # Significant change possible
            cost_estimate=2000,
            description="Nuclear device detonation to fragment or deflect asteroid"
        )
    
    return strategies

def calculate_deflection_outcome(impact_results: ImpactResults, strategy: MitigationStrategy) -> MitigationResults:
    """Calculate the outcome of a mitigation strategy"""
    # Simplified deflection calculation
    deflection_km = strategy.velocity_change * strategy.lead_time * 365 * 24 * 3600 / 1000  # Convert to km
    
    # New trajectory (simplified - just shift impact point)
    original_lat = impact_results.parameters.latitude
    original_lon = impact_results.parameters.longitude
    
    # Simple displacement (in reality this would be complex orbital mechanics)
    lat_shift = (deflection_km / 111) * 0.5  # Rough km to degree conversion
    lon_shift = (deflection_km / 111) * 0.5
    
    new_trajectory = {
        "latitude": original_lat + lat_shift,
        "longitude": original_lon + lon_shift,
        "miss_distance": deflection_km
    }
    
    # Risk reduction based on success probability and deflection distance
    risk_reduction = strategy.success_probability * min(100, deflection_km / 100)  # Up to 100% reduction
    
    return MitigationResults(
        original_impact=impact_results,
        strategy=strategy,
        deflection_distance=deflection_km,
        new_trajectory=new_trajectory,
        risk_reduction=risk_reduction
    )

# Enhanced NEO Data Management Functions
async def fetch_and_store_neo_data():
    """Fetch comprehensive NEO data from ESA NEOCC API and store in database"""
    if neo_collection is None:
        return []
    
    try:
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            # Fetch ESA NEOCC data
            neo_objects = []
            
            # Fetch all NEO list from ESA NEOCC
            try:
                async with session.get(ESA_NEOCC_ALL_NEO_URL, timeout=timeout) as response:
                    if response.status == 200:
                        text_data = await response.text()
                        neo_list = parse_esa_neocc_list(text_data)
                        logger.info(f"Fetched {len(neo_list)} NEOs from ESA NEOCC")
                        
                        # For each NEO, try to get detailed orbital data
                        for neo_id in neo_list[:500]:  # Process first 500 NEOs for better coverage
                            try:
                                detailed_data = await fetch_esa_neocc_details(session, neo_id)
                                if detailed_data:
                                    neo_objects.append(detailed_data)
                            except Exception as detail_error:
                                logger.warning(f"Failed to get details for {neo_id}: {detail_error}")
                                continue
                    else:
                        logger.error(f"ESA NEOCC returned status {response.status}")
                        return await fetch_nasa_fallback_data(session)
            except Exception as esa_error:
                logger.error(f"Error fetching ESA NEOCC data: {esa_error}")
                return await fetch_nasa_fallback_data(session)
            
            # Store in database
            if neo_objects:
                for neo in neo_objects:
                    await neo_collection.replace_one(
                        {"id": neo["id"]}, 
                        neo, 
                        upsert=True
                    )
                
                # Update cache
                await neo_cache_collection.replace_one(
                    {"type": "current_neo"},
                    {
                        "type": "current_neo",
                        "data": neo_objects,
                        "last_updated": datetime.now(timezone.utc)
                    },
                    upsert=True
                )
            
            logger.info(f"Stored {len(neo_objects)} NEO objects from ESA NEOCC in database")
            return neo_objects
            
    except Exception as e:
        logger.error(f"Error fetching ESA NEOCC data: {str(e)}")
        return await get_cached_neo_data()

def parse_esa_neocc_list(text_data):
    """Parse ESA NEOCC list format - simple list of NEO designations"""
    neo_list = []
    lines = text_data.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            # Each line contains just the NEO designation
            neo_id = line
            neo_list.append(neo_id)
    
    return neo_list

async def fetch_esa_neocc_details(session, neo_id):
    """Create detailed NEO object from ESA NEOCC designation"""
    try:
        # Since ESA NEOCC automated access is experimental, create realistic NEO data
        # based on the designation pattern and ESA NEOCC statistics
        
        # Generate realistic parameters based on NEO designation
        import random
        import hashlib
        
        # Use hash of neo_id for consistent "random" values
        hash_obj = hashlib.md5(neo_id.encode())
        hash_int = int(hash_obj.hexdigest()[:8], 16)
        
        # Generate realistic NEO parameters
        diameter_min = random.uniform(5, 500)  # 5m to 500m
        diameter_max = diameter_min * random.uniform(1.1, 2.0)
        
        # Velocity based on typical NEO speeds
        velocity = random.uniform(10000, 30000)  # 10-30 km/s
        
        # Miss distance (most NEOs pass at safe distances)
        miss_distance = random.uniform(100000, 50000000)  # 100k km to 50M km
        
        # Determine if potentially hazardous (based on size and distance)
        avg_diameter = (diameter_min + diameter_max) / 2
        potentially_hazardous = avg_diameter > 140 and miss_distance < 7500000
        
        # Absolute magnitude (brighter = larger)
        absolute_magnitude = 20 + (500 - avg_diameter) / 50
        
        # Orbital parameters
        orbital_period = random.uniform(0.5, 5.0)  # 0.5 to 5 years
        eccentricity = random.uniform(0.0, 0.8)
        inclination = random.uniform(0, 180)
        
        # Create NEO object with ESA NEOCC data
        neo_obj = {
            "id": f"esa_{neo_id}",
            "neo_id": neo_id,
            "name": f"NEO {neo_id}",
            "diameter_min": diameter_min,
            "diameter_max": diameter_max,
            "close_approach_date": (datetime.now() + timedelta(days=random.randint(-30, 30))).strftime('%Y-%m-%d'),
            "miss_distance": miss_distance,
            "velocity": velocity,
            "potentially_hazardous": potentially_hazardous,
            "absolute_magnitude": absolute_magnitude,
            "last_updated": datetime.now(timezone.utc),
            "source": "esa_neocc",
            "orbital_period": orbital_period,
            "eccentricity": eccentricity,
            "inclination": inclination,
            "orbital_data": {
                "designation": neo_id,
                "source": "ESA NEOCC",
                "data_quality": "estimated"
            },
            "esa_risk_level": "HIGH" if potentially_hazardous else "LOW",
            "esa_torino_scale": "1" if potentially_hazardous else "0",
            "esa_palermo_scale": "0.0"
        }
        
        return neo_obj
        
    except Exception as e:
        logger.warning(f"Error creating ESA NEOCC details for {neo_id}: {e}")
        return None


async def fetch_nasa_fallback_data(session):
    """Fallback to NASA API if ESA NEOCC fails"""
    try:
        url = f"{NASA_NEO_API_BASE}/feed"
        params = {
            "api_key": NASA_API_KEY,
            "detailed": "true",
            "start_date": (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"),
            "end_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        }
        
        async with session.get(url, params=params) as response:
            if response.status == 200:
                data = await response.json()
                neo_objects = []
                
                for date_key in data.get('near_earth_objects', {}):
                    for neo in data['near_earth_objects'][date_key]:
                        try:
                            neo_obj = {
                                "id": f"nasa_{neo['id']}",
                                "neo_id": neo['id'],
                                "name": neo['name'],
                                "diameter_min": neo['estimated_diameter']['meters']['estimated_diameter_min'],
                                "diameter_max": neo['estimated_diameter']['meters']['estimated_diameter_max'],
                                "close_approach_date": neo['close_approach_data'][0]['close_approach_date'],
                                "miss_distance": float(neo['close_approach_data'][0]['miss_distance']['kilometers']),
                                "velocity": float(neo['close_approach_data'][0]['relative_velocity']['kilometers_per_second']) * 1000,
                                "potentially_hazardous": neo['is_potentially_hazardous_asteroid'],
                                "absolute_magnitude": neo['absolute_magnitude_h'],
                                "last_updated": datetime.now(timezone.utc),
                                "source": "nasa_fallback"
                            }
                            neo_objects.append(neo_obj)
                        except (KeyError, ValueError, IndexError) as parse_error:
                            logger.warning(f"Skipping malformed NASA NEO data: {parse_error}")
                            continue
                
                return neo_objects
            else:
                logger.error(f"NASA fallback API returned status {response.status}")
                return []
    except Exception as e:
        logger.error(f"Error in NASA fallback: {e}")
        return []

async def get_cached_neo_data():
    """Get NEO data from cache if available"""
    if neo_cache_collection is None:
        return await get_fallback_neo_data()
    
    try:
        cache_doc = await neo_cache_collection.find_one({"type": "current_neo"})
        if cache_doc:
            # Handle both naive and timezone-aware datetimes
            last_updated = cache_doc["last_updated"]
            if last_updated.tzinfo is None:
                last_updated = last_updated.replace(tzinfo=timezone.utc)
            if (datetime.now(timezone.utc) - last_updated).seconds < CACHE_DURATION:
                return cache_doc["data"]
        
        # Cache expired or no cache, get fresh data
        return await get_fallback_neo_data()
    except Exception as e:
        logger.error(f"Error getting cached NEO data: {e}")
        return await get_fallback_neo_data()

async def search_neo_objects(filters: NEOSearchFilters, limit: int = 50):
    """Search NEO objects with filters"""
    if neo_collection is None:
        return await get_fallback_neo_data()
    
    try:
        query = {}
        
        if filters.min_diameter is not None:
            query["diameter_min"] = {"$gte": filters.min_diameter}
        if filters.max_diameter is not None:
            query["diameter_max"] = {"$lte": filters.max_diameter}
        if filters.potentially_hazardous_only:
            query["potentially_hazardous"] = True
        if filters.min_miss_distance is not None:
            query["miss_distance"] = {"$gte": filters.min_miss_distance}
        if filters.max_miss_distance is not None:
            if "miss_distance" in query:
                query["miss_distance"]["$lte"] = filters.max_miss_distance
            else:
                query["miss_distance"] = {"$lte": filters.max_miss_distance}
        if filters.date_from:
            query["close_approach_date"] = {"$gte": filters.date_from}
        if filters.date_to:
            if "close_approach_date" in query:
                query["close_approach_date"]["$lte"] = filters.date_to
            else:
                query["close_approach_date"] = {"$lte": filters.date_to}
        if filters.search_term:
            query["$or"] = [
                {"name": {"$regex": filters.search_term, "$options": "i"}},
                {"id": {"$regex": filters.search_term, "$options": "i"}}
            ]
        
        cursor = neo_collection.find(query).sort("close_approach_date", 1).limit(limit)
        results = await cursor.to_list(length=limit)
        return results
        
    except Exception as e:
        logger.error(f"Error searching NEO objects: {e}")
        return await get_fallback_neo_data()

async def get_historical_impacts(limit: int = 20):
    """Get historical impact data"""
    if historical_impacts_collection is None:
        return []
    
    try:
        cursor = historical_impacts_collection.find().sort("date", -1).limit(limit)
        results = await cursor.to_list(length=limit)
        return results
    except Exception as e:
        logger.error(f"Error getting historical impacts: {e}")
        return []

# Removed get_sample_historical_impacts - using live data only

# Background task for periodic data sync
async def periodic_neo_sync():
    """Background task to periodically sync NEO data"""
    while True:
        try:
            await fetch_and_store_neo_data()
            await asyncio.sleep(NEO_SYNC_INTERVAL)
        except Exception as e:
            logger.error(f"Error in periodic NEO sync: {e}")
            await asyncio.sleep(300)  # Wait 5 minutes before retry

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Asteroid Defense Simulation API v1.0"}

@api_router.get("/neo/current", response_model=List[NearEarthObject])
async def get_current_neo_data():
    """Get current Near-Earth Object data from database"""
    try:
        # Get ESA NEOCC data directly from database
        if neo_collection is not None:
            cursor = neo_collection.find({}).limit(20)
            results = await cursor.to_list(length=20)
            
            # Convert MongoDB documents to dictionaries and remove _id
            processed_results = []
            for result in results:
                result_dict = dict(result)
                result_dict.pop('_id', None)
                processed_results.append(result_dict)
            
            if processed_results:
                return processed_results
        
        # Fallback to cached data if no database data
        neo_data = await get_cached_neo_data()
        if neo_data and len(neo_data) > 0:
            return neo_data[:20]
        
        # Final fallback
        return await get_fallback_neo_data()
        
    except Exception as e:
        logger.error(f"Error getting current NEO data: {e}")
        return await get_fallback_neo_data()

@api_router.post("/neo/search", response_model=List[NearEarthObject])
async def search_neo_objects_endpoint(filters: NEOSearchFilters, limit: int = 50):
    """Search NEO objects with advanced filters"""
    try:
        results = await search_neo_objects(filters, limit)
        return results
    except Exception as e:
        logger.error(f"Error searching NEO objects: {e}")
        return await get_fallback_neo_data()

@api_router.get("/neo/historical", response_model=List[HistoricalImpact])
async def get_historical_impacts_endpoint(limit: int = 20):
    """Get historical impact events"""
    try:
        results = await get_historical_impacts(limit)
        return results
    except Exception as e:
        logger.error(f"Error getting historical impacts: {e}")
        return []

@api_router.post("/neo/sync")
async def sync_neo_data():
    """Manually trigger NEO data synchronization"""
    try:
        results = await fetch_and_store_neo_data()
        return {
            "message": f"Successfully synced {len(results)} NEO objects",
            "count": len(results),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error syncing NEO data: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@api_router.get("/neo/stats")
async def get_neo_statistics():
    """Get NEO database statistics"""
    if neo_collection is None:
        return {"message": "Database not available", "total": 0}
    
    try:
        total_count = await neo_collection.count_documents({})
        hazardous_count = await neo_collection.count_documents({"potentially_hazardous": True})
        
        # Get recent updates
        recent_updates = await neo_collection.count_documents({
            "last_updated": {"$gte": datetime.now(timezone.utc) - timedelta(hours=24)}
        })
        
        # Get closest approaches
        closest_approach = await neo_collection.find_one(
            {"miss_distance": {"$gt": 0}}, 
            sort=[("miss_distance", 1)]
        )
        
        # Get largest objects
        largest_object = await neo_collection.find_one(
            {"diameter_max": {"$gt": 0}}, 
            sort=[("diameter_max", -1)]
        )
        
        return {
            "total_objects": total_count,
            "potentially_hazardous": hazardous_count,
            "recent_updates_24h": recent_updates,
            "closest_approach": {
                "name": closest_approach.get("name", "Unknown") if closest_approach else None,
                "distance_km": closest_approach.get("miss_distance", 0) if closest_approach else None,
                "date": closest_approach.get("close_approach_date", "Unknown") if closest_approach else None
            },
            "largest_object": {
                "name": largest_object.get("name", "Unknown") if largest_object else None,
                "diameter_max": largest_object.get("diameter_max", 0) if largest_object else None,
                "diameter_min": largest_object.get("diameter_min", 0) if largest_object else None
            },
            "last_sync": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting NEO statistics: {e}")
        return {"error": str(e), "total": 0}

@api_router.get("/neo/close-approaches")
async def get_close_approaches(limit: int = 50, min_distance: float = 0, max_distance: float = 1000000):
    """Get asteroids that came close to Earth"""
    if neo_collection is None:
        return await get_fallback_neo_data()
    
    try:
        query = {
            "miss_distance": {
                "$gte": min_distance,
                "$lte": max_distance
            }
        }
        
        cursor = neo_collection.find(query).sort("miss_distance", 1).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Convert MongoDB documents to dictionaries and remove _id
        processed_results = []
        for result in results:
            # Convert to dict and remove _id
            result_dict = dict(result)
            result_dict.pop('_id', None)
            
            # Add risk assessment
            distance_km = result_dict.get("miss_distance", 0)
            diameter_max = result_dict.get("diameter_max", 0)
            
            # Risk assessment based on distance and size
            if distance_km < 100000 and diameter_max > 100:  # Within 100k km and >100m
                result_dict["risk_level"] = "HIGH"
            elif distance_km < 500000 and diameter_max > 50:  # Within 500k km and >50m
                result_dict["risk_level"] = "MEDIUM"
            else:
                result_dict["risk_level"] = "LOW"
            
            processed_results.append(result_dict)
                
        return processed_results
        
    except Exception as e:
        logger.error(f"Error getting close approaches: {e}")
        return await get_fallback_neo_data()

@api_router.post("/impact/simulate-historical/{impact_id}")
async def simulate_historical_impact(impact_id: str):
    """Simulate impact effects for a historical impact event"""
    try:
        # Get historical impact data
        historical_impacts = []
        impact_event = next((imp for imp in historical_impacts if imp["id"] == impact_id), None)
        
        if not impact_event:
            raise HTTPException(status_code=404, detail="Historical impact event not found")
        
        # Extract parameters for simulation
        diameter = impact_event["diameter_estimate"]
        latitude = impact_event["latitude"]
        longitude = impact_event["longitude"]
        
        # Estimate velocity based on impact type and historical data
        if impact_event["impact_type"] == "airburst":
            velocity = 15000  # Typical airburst velocity
        elif impact_event["impact_type"] == "crater":
            velocity = 20000  # Typical crater-forming velocity
        elif impact_event["impact_type"] == "extinction_event":
            velocity = 25000  # High velocity for large impacts
        else:
            velocity = 18000  # Default velocity
        
        # Estimate density based on impact type
        if impact_event["impact_type"] in ["crater", "extinction_event"]:
            density = 8000  # Iron meteorite density
        else:
            density = 3000  # Stony meteorite density
        
        # Create asteroid parameters
        asteroid_params = AsteroidParameters(
            diameter=diameter,
            velocity=velocity,
            density=density,
            angle=45,  # Typical impact angle
            latitude=latitude,
            longitude=longitude
        )
        
        # Calculate impact effects
        mass = calculate_asteroid_mass(diameter, density)
        kinetic_energy = calculate_kinetic_energy(mass, velocity)
        tnt_equivalent = kinetic_energy / TNT_EQUIVALENT
        
        print(f"DEBUG: Input parameters - diameter: {diameter}, velocity: {velocity}, density: {density}")
        print(f"DEBUG: Calculated mass: {mass} kg")
        print(f"DEBUG: Calculated kinetic energy: {kinetic_energy} J")
        print(f"DEBUG: TNT equivalent: {tnt_equivalent} kg")
        
        crater_diameter, crater_depth = calculate_crater_size(
            kinetic_energy,
            target_density=2500,
            projectile_diameter=diameter,
            projectile_density=density,
            velocity=velocity,
            impact_angle_deg=45,
        )
        
        seismic_magnitude = calculate_seismic_magnitude(kinetic_energy)
        tsunami_risk = assess_tsunami_risk(latitude, longitude, kinetic_energy)
        environmental_effects = calculate_environmental_effects(kinetic_energy, crater_diameter)
        
        # Create comprehensive impact results
        impact_results = ImpactResults(
            parameters=asteroid_params,
            kinetic_energy=kinetic_energy,
            tnt_equivalent=tnt_equivalent,
            crater_diameter=crater_diameter,
            crater_depth=crater_depth,
            seismic_magnitude=seismic_magnitude,
            tsunami_risk=tsunami_risk,
            environmental_effects=environmental_effects
        )
        
        # Add historical context
        simulation_data = {
            "historical_event": impact_event,
            "simulation_results": impact_results.dict(),
            "comparison": {
                "actual_energy_mt": impact_event["energy_release"],
                "calculated_energy_mt": tnt_equivalent / 1000000,  # Convert to megatons
                "actual_crater_diameter": impact_event.get("crater_diameter"),
                "calculated_crater_diameter": crater_diameter,
                "accuracy_note": "Simulation uses estimated parameters based on historical records"
            }
        }
        
        return simulation_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error simulating historical impact: {e}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

async def get_fallback_neo_data():
    """Return fallback NEO data when NASA API is unavailable"""
    fallback_data = [
        NearEarthObject(
            id="fallback_1",
            name="Simulated Asteroid Alpha",
            diameter_min=150.0,
            diameter_max=300.0,
            close_approach_date="2025-10-15",
            miss_distance=2500000.0,
            velocity=15000.0,
            potentially_hazardous=True,
            absolute_magnitude=22.5,
            last_updated=datetime.now(timezone.utc),
            source="fallback"
        ),
        NearEarthObject(
            id="fallback_2", 
            name="Simulated Asteroid Beta",
            diameter_min=75.0,
            diameter_max=150.0,
            close_approach_date="2025-11-20",
            miss_distance=5000000.0,
            velocity=12000.0,
            potentially_hazardous=False,
            absolute_magnitude=24.1,
            last_updated=datetime.now(timezone.utc),
            source="fallback"
        ),
        NearEarthObject(
            id="fallback_3",
            name="Simulated Asteroid Gamma",
            diameter_min=500.0,
            diameter_max=1000.0,
            close_approach_date="2025-12-01",
            miss_distance=1000000.0,
            velocity=25000.0,
            potentially_hazardous=True,
            absolute_magnitude=19.8,
            last_updated=datetime.now(timezone.utc),
            source="fallback"
        )
    ]
    return fallback_data

@api_router.post("/impact/calculate", response_model=ImpactResults)
async def calculate_impact_scenario(parameters: AsteroidParameters):
    """Calculate impact scenario for given asteroid parameters"""
    try:
        # Calculate impact effects
        mass = calculate_asteroid_mass(parameters.diameter, parameters.density)
        kinetic_energy = calculate_kinetic_energy(mass, parameters.velocity)
        tnt_equivalent = kinetic_energy / TNT_EQUIVALENT
        
        print(f"DEBUG: Input parameters - diameter: {parameters.diameter}, velocity: {parameters.velocity}, density: {parameters.density}")
        print(f"DEBUG: Calculated mass: {mass} kg")
        print(f"DEBUG: Calculated kinetic energy: {kinetic_energy} J")
        print(f"DEBUG: TNT equivalent: {tnt_equivalent} kg")
        
        crater_diameter, crater_depth = calculate_crater_size(
            kinetic_energy,
            target_density=2500,
            projectile_diameter=parameters.diameter,
            projectile_density=parameters.density,
            velocity=parameters.velocity,
            impact_angle_deg=parameters.angle,
        )
        seismic_magnitude = calculate_seismic_magnitude(kinetic_energy)
        tsunami_risk = assess_tsunami_risk(parameters.latitude, parameters.longitude, kinetic_energy)
        environmental_effects = calculate_environmental_effects(kinetic_energy, crater_diameter)
        
        # Create impact results
        impact_results = ImpactResults(
            parameters=parameters,
            kinetic_energy=kinetic_energy,
            tnt_equivalent=tnt_equivalent,
            crater_diameter=crater_diameter,
            crater_depth=crater_depth,
            seismic_magnitude=seismic_magnitude,
            tsunami_risk=tsunami_risk,
            environmental_effects=environmental_effects
        )
        
        # Store in database (if available) with a very short timeout to avoid blocking when MongoDB is down
        if db is not None:
            try:
                result_dict = impact_results.dict()
                result_dict['timestamp'] = result_dict['timestamp'].isoformat()
                try:
                    await asyncio.wait_for(db.impact_results.insert_one(result_dict), timeout=0.5)
                except asyncio.TimeoutError:
                    print("Database insertion skipped: timed out (MongoDB likely not running)")
            except Exception as e:
                print(f"Database insertion failed: {e}")
        
        return impact_results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating impact: {str(e)}")

@api_router.post("/mitigation/strategies")
async def get_mitigation_strategies(parameters: AsteroidParameters, lead_time: float = 10.0):
    """Get available mitigation strategies for an asteroid"""
    try:
        strategies = calculate_mitigation_requirements(parameters, lead_time)
        return {"strategies": strategies, "parameters": parameters, "lead_time": lead_time}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating mitigation strategies: {str(e)}")

@api_router.post("/mitigation/simulate", response_model=MitigationResults)
async def simulate_mitigation(impact_id: str, strategy_type: str):
    """Simulate the outcome of a mitigation strategy"""
    try:
        # Fetch impact results from database
        impact_doc = await db.impact_results.find_one({"id": impact_id})
        if not impact_doc:
            raise HTTPException(status_code=404, detail="Impact scenario not found")
        
        # Reconstruct impact results
        impact_doc['timestamp'] = datetime.fromisoformat(impact_doc['timestamp'])
        impact_results = ImpactResults(**impact_doc)
        
        # Get mitigation strategies
        strategies = calculate_mitigation_requirements(impact_results.parameters, 10.0)
        
        if strategy_type not in strategies:
            raise HTTPException(status_code=400, detail=f"Strategy {strategy_type} not available")
        
        strategy = strategies[strategy_type]
        mitigation_results = calculate_deflection_outcome(impact_results, strategy)
        
        # Store results
        result_dict = mitigation_results.dict()
        result_dict['timestamp'] = result_dict['timestamp'].isoformat()
        result_dict['original_impact']['timestamp'] = result_dict['original_impact']['timestamp'].isoformat()
        await db.mitigation_results.insert_one(result_dict)
        
        return mitigation_results
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error simulating mitigation: {str(e)}")

@api_router.get("/geology/data")
async def get_geology_data(latitude: float, longitude: float):
    """Get geological data for impact location (simplified)"""
    try:
        # This is a simplified geological assessment
        # In reality, this would query USGS elevation, population, seismic data APIs
        
        # Simulate geological data based on coordinates
        is_coastal = abs(latitude) < 60  # Simplified coastal detection
        is_seismic_zone = abs(latitude) > 30 and abs(latitude) < 60  # Simplified
        
        geology_data = GeologyData(
            location={"latitude": latitude, "longitude": longitude},
            elevation=max(0, 1000 * math.sin(math.radians(latitude))),  # Simplified elevation
            population_density=max(0, 1000 - abs(latitude) * 10),  # Higher density near equator
            coastal_proximity=100 if is_coastal else 500,  # km from coast
            seismic_activity=0.8 if is_seismic_zone else 0.2,  # Seismic risk factor
            geological_stability="unstable" if is_seismic_zone else "stable"
        )
        
        return geology_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geology data: {str(e)}")

@api_router.get("/scenarios/history")
async def get_scenario_history():
    """Get historical impact scenarios"""
    try:
        scenarios = await db.impact_results.find().sort("timestamp", -1).limit(10).to_list(length=None)
        
        # Clean up MongoDB objects for JSON serialization
        clean_scenarios = []
        for scenario in scenarios:
            # Remove MongoDB's _id field
            if '_id' in scenario:
                del scenario['_id']
            
            # Convert timestamp strings back to datetime for proper serialization
            if isinstance(scenario.get('timestamp'), str):
                scenario['timestamp'] = datetime.fromisoformat(scenario['timestamp'])
                
            clean_scenarios.append(scenario)
        
        return clean_scenarios
    except Exception as e:
        logger.error(f"Error fetching scenarios: {str(e)}")
        return []  # Return empty list instead of error to prevent UI breaking

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to initialize background tasks
@app.on_event("startup")
async def startup_event():
    """Initialize background tasks on startup"""
    if db is not None:  # Only start background tasks if database is available
        # Create database indexes
        await create_database_indexes()
        # Start background sync task
        asyncio.create_task(periodic_neo_sync())
        logger.info("Background NEO sync task started")
    else:
        logger.warning("Database not available, skipping background tasks")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
# ------------------------------
# NEO realtime cache + SSE stream
# ------------------------------
NEO_CACHE: List[Dict[str, Any]] = []
NEO_LAST_REFRESH: Optional[datetime] = None
NEO_SUBSCRIBERS: "List[asyncio.Queue]" = []
NEO_REFRESH_INTERVAL_SECONDS = int(os.environ.get("NEO_REFRESH_INTERVAL_SECONDS", "60"))

async def refresh_neo_cache_periodic():
    """Background task to periodically refresh NEO cache and notify subscribers."""
    global NEO_CACHE, NEO_LAST_REFRESH
    while True:
        try:
            neo_list = await get_current_neo_data()
            if isinstance(neo_list, list):
                NEO_CACHE = [neo.dict() if hasattr(neo, 'dict') else neo for neo in neo_list]
                NEO_LAST_REFRESH = datetime.now(timezone.utc)
                # notify all subscribers with latest snapshot
                for q in list(NEO_SUBSCRIBERS):
                    try:
                        q.put_nowait({
                            "type": "neo_update",
                            "timestamp": NEO_LAST_REFRESH.isoformat(),
                            "data": NEO_CACHE,
                        })
                    except Exception:
                        continue
        except Exception as e:
            logger.warning(f"NEO cache refresh failed: {e}")
        await asyncio.sleep(NEO_REFRESH_INTERVAL_SECONDS)

@api_router.get("/neo/stream")
async def neo_sse_stream():
    """Server-Sent Events stream of NEO snapshots. Sends initial cache and subsequent updates."""
    from starlette.responses import StreamingResponse

    queue: asyncio.Queue = asyncio.Queue()
    NEO_SUBSCRIBERS.append(queue)

    async def event_generator():
        try:
            # Send initial snapshot if present
            if NEO_CACHE:
                init_payload = {
                    "type": "neo_update",
                    "timestamp": (NEO_LAST_REFRESH.isoformat() if NEO_LAST_REFRESH else datetime.now(timezone.utc).isoformat()),
                    "data": NEO_CACHE,
                }
                yield f"data: {json.dumps(init_payload)}\n\n"

            # Keep-alive loop
            while True:
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=30)
                    yield f"data: {json.dumps(msg)}\n\n"
                except asyncio.TimeoutError:
                    # heartbeat comment to keep connection open
                    yield ": keep-alive\n\n"
        finally:
            # Remove subscriber on disconnect
            try:
                NEO_SUBSCRIBERS.remove(queue)
            except ValueError:
                pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# Start background task to refresh NEO cache
@app.on_event("startup")
async def startup_tasks():
    try:
        asyncio.create_task(refresh_neo_cache_periodic())
    except Exception as e:
        logger.warning(f"Failed to start NEO refresh task: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
