import React, { useState, useEffect, useRef } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Button } from './components/ui/button';
import GameSaveEarth from './components/GameSaveEarth';
import EarthImpact3D from './components/EarthImpact3D';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet.heat';
import { antPath } from 'leaflet-ant-path';
import { get_city_data, getEnhancedPopulationData, get_multiple_cities_data } from './utils/geoDBAPI';

// Optimized Space Background Animation Component
function SpaceBackground() {
  const [stars] = useState(() => {
    // Generate stars only once and memoize
    const newStars = [];
    for (let i = 0; i < 100; i++) { // Reduced from 200 to 100
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1, // Smaller range
        opacity: Math.random() * 0.6 + 0.4,
        twinkleDelay: Math.random() * 4
      });
    }
    return newStars;
  });

  const [shootingStars] = useState(() => {
    // Generate shooting stars only once
    const newShootingStars = [];
    for (let i = 0; i < 3; i++) { // Reduced from 5 to 3
      newShootingStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        angle: Math.random() * 360,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 10
      });
    }
    return newShootingStars;
  });
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Professional Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Subtle Professional Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-slate-800/10 to-gray-900/8 opacity-40"></div>
      
      {/* Minimal Cosmic Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-900/3 to-slate-900/8 animate-nebula"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-radial from-white/3 via-gray-600/2 to-transparent rounded-full animate-space-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-white/2 via-gray-500/1 to-transparent rounded-full animate-cosmic-dust"></div>
      
      {/* Reduced Parallax Star Layers */}
      <div className="absolute inset-0 parallax-stars-slow">
        {[...Array(20)].map((_, i) => (
          <div
            key={`slow-${i}`}
            className="absolute w-1 h-1 bg-white/60 rounded-full hardware-accelerated"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      {/* Main Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white star-glow"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${star.twinkleDelay}s`
          }}
        />
      ))}

      {/* Shooting Stars with Trails */}
      {shootingStars.map((shootingStar) => (
        <div
          key={shootingStar.id}
          className="absolute"
          style={{
            left: `${shootingStar.x}%`,
            top: `${shootingStar.y}%`,
            transform: `rotate(${shootingStar.angle}deg)`
          }}
        >
          {/* Main shooting star */}
          <div
            className="w-2 h-2 bg-white rounded-full space-glow"
            style={{
              animation: `shooting-star ${shootingStar.duration}s linear infinite`,
              animationDelay: `${shootingStar.delay}s`
            }}
          />
          {/* Trail effect */}
          <div
            className="absolute w-8 h-0.5 bg-gradient-to-r from-white via-gray-200 to-transparent -translate-x-8 top-1/2 -translate-y-1/2"
            style={{
              animation: `shooting-star ${shootingStar.duration}s linear infinite`,
              animationDelay: `${shootingStar.delay}s`,
              opacity: 0.6
            }}
          />
        </div>
      ))}

      {/* Reduced Floating Space Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full hardware-accelerated"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random()}px`,
              height: `${1 + Math.random()}px`,
              backgroundColor: ['#60a5fa', '#a78bfa'][Math.floor(Math.random() * 2)],
              animation: `animate-float ${10 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.4
            }}
          />
        ))}
      </div>

      {/* Subtle Aurora-like Effects */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/3 via-gray-600/4 to-transparent animate-aurora"></div>
      <div className="absolute bottom-0 right-0 w-full h-40 bg-gradient-to-t from-gray-600/4 via-white/2 to-transparent animate-aurora" style={{ animationDelay: '7s' }}></div>
    </div>
  );
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

// Mock data for testing when backend is not available
// Removed MOCK_IMPACT_RESULTS - using live AI analysis

// Removed MOCK_MITIGATION_STRATEGIES - using live AI analysis

// Removed MOCK_NEO_DATA - using live NASA API data

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Utility Functions (moved to global scope)
// Enhanced population data using GeoDB API with fallback
const getPopulationData = async (lat, lng, cityName = null) => {
  if (!lat || !lng) return { population: 0, density: 0 };
  
  try {
    // Try to use GeoDB API for more accurate data
    const enhancedData = await getEnhancedPopulationData(lat, lng, cityName);
    return {
      population: enhancedData.population,
      density: enhancedData.density,
      city: enhancedData.city,
      country: enhancedData.country,
      source: enhancedData.source
    };
  } catch (error) {
    console.warn('GeoDB API failed, using fallback method:', error);
    
    // Fallback to original hardcoded method
  const majorCities = [
    { lat: 40.7128, lng: -74.0060, pop: 8400000 }, // NYC
    { lat: 51.5074, lng: -0.1278, pop: 9000000 },  // London
    { lat: 35.6762, lng: 139.6503, pop: 14000000 }, // Tokyo
    { lat: 28.6139, lng: 77.2090, pop: 32000000 },  // Delhi
    { lat: -23.5505, lng: -46.6333, pop: 12300000 }, // São Paulo
  ];

  let nearestCity = majorCities[0];
  let minDistance = Number.MAX_VALUE;

  majorCities.forEach(city => {
    const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  // Population decreases with distance from major cities
  const distanceFactor = Math.max(0.1, 1 - (minDistance / 50));
  const estimatedPopulation = Math.floor(nearestCity.pop * distanceFactor);
  
  return {
    population: estimatedPopulation,
      density: Math.floor(estimatedPopulation / 1000), // people per km²
      city: 'Unknown',
      country: 'Unknown',
      source: 'fallback_hardcoded'
    };
  }
};

// Synchronous version for backward compatibility
const getPopulationDataSync = (lat, lng) => {
  if (!lat || !lng) return { population: 0, density: 0 };
  
  const majorCities = [
    { lat: 40.7128, lng: -74.0060, pop: 8400000 }, // NYC
    { lat: 51.5074, lng: -0.1278, pop: 9000000 },  // London
    { lat: 35.6762, lng: 139.6503, pop: 14000000 }, // Tokyo
    { lat: 28.6139, lng: 77.2090, pop: 32000000 },  // Delhi
    { lat: -23.5505, lng: -46.6333, pop: 12300000 }, // São Paulo
  ];

  let nearestCity = majorCities[0];
  let minDistance = Number.MAX_VALUE;

  majorCities.forEach(city => {
    const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  const distanceFactor = Math.max(0.1, 1 - (minDistance / 50));
  const estimatedPopulation = Math.floor(nearestCity.pop * distanceFactor);
  
  return {
    population: estimatedPopulation,
    density: Math.floor(estimatedPopulation / 1000)
  };
};

// Enhanced economic damage calculation
const calculateEconomicDamage = (impactResults, selectedPosition, popData, affectedArea) => {
  // Base damage from TNT equivalent (simplified current method)
  const baseDamage = (impactResults.tnt_equivalent / 1000000) * 100;
  
  // Location-based economic factors
  const economicFactors = {
    // Major economic centers (higher GDP per capita)
    majorCities: [
      { lat: 40.7128, lng: -74.0060, factor: 15.0, name: "New York" }, // NYC
      { lat: 51.5074, lng: -0.1278, factor: 12.0, name: "London" },
      { lat: 35.6762, lng: 139.6503, factor: 14.0, name: "Tokyo" },
      { lat: 37.7749, lng: -122.4194, factor: 16.0, name: "San Francisco" },
      { lat: 22.3193, lng: 114.1694, factor: 13.0, name: "Hong Kong" },
      { lat: 47.6062, lng: -122.3321, factor: 14.0, name: "Seattle" },
      { lat: 25.7617, lng: -80.1918, factor: 8.0, name: "Miami" }
    ],
    // Developing regions (lower economic impact per unit)
    developingRegions: [
      { lat: 28.6139, lng: 77.2090, factor: 3.0, name: "Delhi" },
      { lat: -23.5505, lng: -46.6333, factor: 4.0, name: "São Paulo" },
      { lat: 6.5244, lng: 3.3792, factor: 2.0, name: "Lagos" },
      { lat: 30.0444, lng: 31.2357, factor: 2.5, name: "Cairo" }
    ]
  };
  
  // Find nearest economic center and its factor
  let economicMultiplier = 1.0; // Base multiplier for rural/unknown areas
  let nearestDistance = Number.MAX_VALUE;
  
  [...economicFactors.majorCities, ...economicFactors.developingRegions].forEach(city => {
    const distance = Math.sqrt(
      Math.pow(selectedPosition.latitude - city.lat, 2) + 
      Math.pow(selectedPosition.longitude - city.lng, 2)
    );
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      // Economic impact decreases with distance from economic center
      const distanceDecay = Math.max(0.1, 1 - (distance / 10)); // 10 degree falloff
      economicMultiplier = city.factor * distanceDecay;
    }
  });
  
  // Infrastructure density factor based on population density
  const infrastructureFactor = Math.min(3.0, 1 + (popData.density / 1000)); // Higher density = more infrastructure
  
  // Impact area scaling (larger areas = disproportionately more damage due to network effects)
  const areaScalingFactor = Math.min(2.0, 1 + Math.log10(affectedArea / 1000)); // Logarithmic scaling
  
  // Environmental/climate damage multiplier
  const environmentalMultiplier = impactResults.environmental_effects.dust_injection > 20 ? 1.5 : 1.0;
  
  // Calculate final economic damage
  const totalDamage = baseDamage * economicMultiplier * infrastructureFactor * areaScalingFactor * environmentalMultiplier;
  
  return {
    totalDamage: Math.floor(totalDamage),
    breakdown: {
      baseDamage: Math.floor(baseDamage),
      economicMultiplier: economicMultiplier.toFixed(2),
      infrastructureFactor: infrastructureFactor.toFixed(2),
      areaScalingFactor: areaScalingFactor.toFixed(2),
      environmentalMultiplier: environmentalMultiplier.toFixed(2)
    }
  };
};

// AI Impact Analysis System
const generateAIExplanation = (impactResults, selectedPosition, metrics) => {
  if (!impactResults || !selectedPosition || !metrics) return null;

  const energy = impactResults.kinetic_energy / 1e15; // Convert to PJ
  const tntEquivalent = impactResults.tnt_equivalent / 1e6; // Convert to MT
  const craterSize = impactResults.crater_diameter / 1000; // Convert to km
  const casualties = metrics.casualties;
  const economicDamage = metrics.economicDamage;

  let threatLevel = '';
  let explanation = '';
  let consequences = [];
  let comparison = '';
  let recommendations = [];

  // Determine threat level based on multiple factors
  if (casualties > 10000000 || energy > 100000 || tntEquivalent > 50000) {
    threatLevel = 'EXTINCTION-LEVEL EVENT';
    explanation = `This impact represents a civilization-ending catastrophe. With ${energy.toFixed(1)} petajoules of energy (equivalent to ${tntEquivalent.toFixed(0)} megatons of TNT), this event would trigger global devastation comparable to the meteor that killed the dinosaurs 66 million years ago.`;
    consequences = [
      'Global climate disruption lasting decades',
      'Massive tsunamis if impact occurs in ocean',
      'Worldwide crop failures and famine',
      'Collapse of modern civilization',
      'Potential human extinction',
      'Global firestorms and debris clouds'
    ];
    comparison = 'Similar to the Chicxulub impact that ended the Cretaceous period';
  } else if (casualties > 1000000 || energy > 10000 || tntEquivalent > 5000) {
    threatLevel = 'GLOBAL CATASTROPHE';
    explanation = `This is a civilization-threatening event that would cause widespread global damage. The ${craterSize.toFixed(1)}km crater and ${casualties.toLocaleString()} estimated casualties represent a disaster that would reshape human history and trigger a global crisis lasting years.`;
    consequences = [
      'Regional devastation with global climate effects',
      'International economic collapse',
      'Mass refugee movements',
      'Severe agricultural disruption',
      'Breakdown of global supply chains',
      'Potential nuclear winter effects'
    ];
    comparison = 'Comparable to the largest volcanic eruptions in recorded history';
  } else if (casualties > 100000 || energy > 1000 || tntEquivalent > 500) {
    threatLevel = 'REGIONAL CATASTROPHE';
    explanation = `This represents a major regional disaster with significant international implications. The impact energy of ${energy.toFixed(1)} petajoules would devastate the immediate area and cause severe economic disruption estimated at $${economicDamage.toLocaleString()}M, affecting multiple countries.`;
    consequences = [
      'Complete destruction within blast radius',
      'Regional climate and weather disruption',
      'International humanitarian crisis',
      'Severe economic impacts on global markets',
      'Large-scale evacuation requirements',
      'Long-term environmental contamination'
    ];
    comparison = 'Similar to the 1815 Mount Tambora eruption that caused global climate anomalies';
  } else if (casualties > 10000 || energy > 100 || tntEquivalent > 50) {
    threatLevel = 'MAJOR DISASTER';
    explanation = `This constitutes a significant natural disaster with devastating local effects. While localized to the impact region, the ${casualties.toLocaleString()} casualties and $${economicDamage.toLocaleString()}M in damage would make this one of the worst natural disasters in modern history.`;
    consequences = [
      'Total destruction of nearby cities',
      'Severe regional infrastructure damage',
      'National emergency response required',
      'Significant economic losses',
      'Long-term health and environmental effects',
      'Potential political instability'
    ];
    comparison = 'Comparable to the most devastating earthquakes or volcanic eruptions';
  } else if (casualties > 1000 || energy > 10 || tntEquivalent > 5) {
    threatLevel = 'SIGNIFICANT EVENT';
    explanation = `This represents a serious but manageable disaster. The impact would cause substantial local damage with ${casualties.toLocaleString()} casualties, but recovery would be possible with appropriate emergency response and international aid.`;
    consequences = [
      'Severe local destruction',
      'Significant casualties and injuries',
      'Regional infrastructure damage',
      'Economic losses in affected areas',
      'Environmental contamination',
      'Emergency evacuation needed'
    ];
    comparison = 'Similar to major industrial accidents or natural disasters';
  } else {
    threatLevel = 'LOCAL EVENT';
    explanation = `While still dangerous, this impact would primarily affect the immediate area. The relatively small energy release of ${energy.toFixed(1)} petajoules would cause local damage but wouldn't threaten regional stability or trigger widespread consequences.`;
    consequences = [
      'Local property damage',
      'Potential casualties in impact zone',
      'Temporary disruption of local services',
      'Environmental cleanup required',
      'Scientific interest and investigation',
      'Possible meteorite recovery'
    ];
    comparison = 'Similar to the Chelyabinsk meteor event of 2013';
  }

  // Generate recommendations based on threat level
  if (threatLevel === 'EXTINCTION-LEVEL EVENT' || threatLevel === 'GLOBAL CATASTROPHE') {
    recommendations = [
      'Immediate global coordinated response required',
      'Underground shelter construction for survivors',
      'Seed banks and genetic repositories preservation',
      'International emergency protocols activation',
      'Space-based observation and deflection systems',
      'Post-impact civilization rebuilding plans'
    ];
  } else if (threatLevel === 'REGIONAL CATASTROPHE' || threatLevel === 'MAJOR DISASTER') {
    recommendations = [
      'Massive evacuation of impact zone',
      'International humanitarian aid mobilization',
      'Emergency medical facilities preparation',
      'Supply chain rerouting and stockpiling',
      'Environmental monitoring systems deployment',
      'Long-term reconstruction planning'
    ];
  } else {
    recommendations = [
      'Local emergency services activation',
      'Evacuation of immediate impact area',
      'Medical response team deployment',
      'Scientific investigation and study',
      'Infrastructure damage assessment',
      'Community support and recovery aid'
    ];
  }

  return {
    threatLevel,
    explanation,
    consequences,
    comparison,
    recommendations,
    confidence: 'High', // AI confidence level
    analysisDate: new Date().toISOString()
  };
};

// AI Defense Analysis Function
const generateAIAnalysis = async (aiConfig, impactResults) => {
  console.log('🤖 Starting AI Analysis...', { aiConfig, impactResults });
  
  if (!aiConfig.enabled || !aiConfig.apiKey || !impactResults) {
    const error = 'AI analysis requires API key and impact results';
    console.error('❌ AI Analysis Error:', error);
    throw new Error(error);
  }

  try {
    console.log('📡 Sending request to AI API...');
    const response = await fetch('http://localhost:5001/api/defense-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: aiConfig.provider,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        impactData: {
          // Primary physical inputs
          diameter: impactResults.diameter,
          velocity: impactResults.velocity,
          kinetic_energy: impactResults.kinetic_energy,
          tnt_equivalent: impactResults.tnt_equivalent,
          density: impactResults.density,
          angle: impactResults.angle,
          environmental_effects: impactResults.environmental_effects,
          // Optional precomputed and user-specified fields expected by backend
          _ai_massKg: impactResults._ai_massKg,
          _ai_kineticEnergyJ: impactResults._ai_kineticEnergyJ,
          _ai_deltaV_mps: impactResults._ai_deltaV_mps,
          _ai_warningTimeYears: impactResults._ai_warningTimeYears,
          // Also pass warningTime for camelCase fallback
          warningTime: aiConfig.warningTime
        }
      })
    });

    console.log('📡 AI API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API Error Response:', errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ AI Analysis Success:', result);
    return result;
  } catch (error) {
    console.error('❌ AI Analysis Failed:', error);
    throw error;
  }
};

// Calculate impact metrics (global function) - now async to support GeoDB API
const calculateImpactMetrics = async (impactResults, selectedPosition, cityName = null) => {
  if (!impactResults || !selectedPosition) return null;

  try {
    const popData = await getPopulationData(selectedPosition.latitude, selectedPosition.longitude, cityName);
  const craterRadiusKm = impactResults.crater_diameter / 2000; // Convert to km
  const affectedArea = Math.PI * Math.pow(craterRadiusKm * 10, 2); // Affected area in km²
  
  // Calculate enhanced economic damage
  const economicDamageResult = calculateEconomicDamage(impactResults, selectedPosition, popData, affectedArea);
  
  const metrics = {
    populationAffected: Math.min(popData.population, Math.floor(affectedArea * popData.density)),
    casualties: Math.floor(Math.min(popData.population, affectedArea * popData.density) * 0.7), // 70% casualty rate
    economicDamage: economicDamageResult.totalDamage,
    economicBreakdown: economicDamageResult.breakdown,
      environmentalScore: Math.min(100, Math.floor(impactResults.environmental_effects.dust_injection * 2)),
      city: popData.city,
      country: popData.country,
      dataSource: popData.source
  };

  // Generate AI explanation
  const aiAnalysis = generateAIExplanation(impactResults, selectedPosition, metrics);
  metrics.aiAnalysis = aiAnalysis;

  return metrics;
  } catch (error) {
    console.error('Error calculating impact metrics:', error);
    // Fallback to synchronous method
    const popData = getPopulationDataSync(selectedPosition.latitude, selectedPosition.longitude);
    const craterRadiusKm = impactResults.crater_diameter / 2000;
    const affectedArea = Math.PI * Math.pow(craterRadiusKm * 10, 2);
    const economicDamageResult = calculateEconomicDamage(impactResults, selectedPosition, popData, affectedArea);
    
    const metrics = {
      populationAffected: Math.min(popData.population, Math.floor(affectedArea * popData.density)),
      casualties: Math.floor(Math.min(popData.population, affectedArea * popData.density) * 0.7),
      economicDamage: economicDamageResult.totalDamage,
      economicBreakdown: economicDamageResult.breakdown,
      environmentalScore: Math.min(100, Math.floor(impactResults.environmental_effects.dust_injection * 2)),
      city: 'Unknown',
      country: 'Unknown',
      dataSource: 'fallback_sync'
    };

    const aiAnalysis = generateAIExplanation(impactResults, selectedPosition, metrics);
    metrics.aiAnalysis = aiAnalysis;

    return metrics;
  }
};

// Performance optimization hook
const usePerformanceMode = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Detect if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsLowPerformance(mediaQuery.matches);

    const handleChange = (e) => setIsLowPerformance(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isLowPerformance;
};

// Impact Simulation Component - Enhanced Neal.fun style
function ImpactSimulation({ 
  impactResults, 
  selectedPosition, 
  impactMetrics,
  onClose, 
  simulationStep, 
  setSimulationStep, 
  onOpen3D 
}) {
  const mapRef = useRef();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('approaching');
  const [showEffects, setShowEffects] = useState({
    fireball: false,
    crater: false,
    shockwave: false,
    thermal: false,
    seismic: false,
    winds: false
  });
  const [effectRadii, setEffectRadii] = useState({});
  const [impactSound, setImpactSound] = useState(false);

  // Calculate realistic effect radii based on meteor parameters
  useEffect(() => {
    if (!impactResults) return;
    
    const diameter = impactResults.parameters?.diameter || 100; // meters
    const velocity = impactResults.parameters?.velocity || 20000; // m/s
    const energy = impactResults.kinetic_energy || (diameter * velocity * velocity * 1000); // Joules
    
    // Calculate effect radii in kilometers (based on scientific models)
    const craterRadius = Math.pow(energy / 1e15, 0.25) * 0.5; // Crater radius
    const fireballRadius = Math.pow(energy / 1e15, 0.4) * 2; // Fireball radius
    const thermalRadius = Math.pow(energy / 1e15, 0.33) * 10; // Thermal radiation
    const shockwaveRadius = Math.pow(energy / 1e15, 0.25) * 25; // Air blast
    const seismicRadius = Math.pow(energy / 1e15, 0.2) * 100; // Seismic effects
    const windRadius = Math.pow(energy / 1e15, 0.3) * 50; // High winds
    
    setEffectRadii({
      crater: Math.max(0.1, craterRadius),
      fireball: Math.max(0.5, fireballRadius),
      thermal: Math.max(2, thermalRadius),
      shockwave: Math.max(5, shockwaveRadius),
      seismic: Math.max(20, seismicRadius),
      winds: Math.max(10, windRadius)
    });
  }, [impactResults]);

  useEffect(() => {
    if (simulationStep === 0) return;

    const phases = ['approaching', 'impact', 'fireball', 'effects', 'aftermath'];
    const phaseDuration = 2500; // 2.5 seconds per phase
    
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        const newProgress = prev + 0.8; // Slower, more dramatic
        const phaseIndex = Math.floor(newProgress / (100 / phases.length));
        
        if (phaseIndex < phases.length) {
          setCurrentPhase(phases[phaseIndex]);
          
          // Trigger effects based on phase
          if (phases[phaseIndex] === 'impact') {
            setImpactSound(true);
            setTimeout(() => setImpactSound(false), 1000);
          }
          
          if (phases[phaseIndex] === 'fireball') {
            setShowEffects(prev => ({ ...prev, fireball: true, crater: true }));
          }
          
          if (phases[phaseIndex] === 'effects') {
            setShowEffects(prev => ({ 
              ...prev, 
              thermal: true, 
              shockwave: true, 
              seismic: true, 
              winds: true 
            }));
          }
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, phaseDuration / 25); // Update 25 times per phase

    return () => clearInterval(interval);
  }, [simulationStep]);

  // Add keyboard shortcut to exit simulation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const getRealisticEffectZones = () => {
    if (!impactResults || !selectedPosition || !effectRadii.crater) return [];
    
    const zones = [];
    
    // Crater zone (total destruction)
    if (showEffects.crater) {
      zones.push({
        radius: effectRadii.crater,
        color: '#000000',
        fillColor: '#330000',
        opacity: 0.9,
        label: `Crater Zone (${effectRadii.crater.toFixed(1)}km)`,
        description: 'Complete vaporization'
      });
    }
    
    // Fireball zone
    if (showEffects.fireball) {
      zones.push({
        radius: effectRadii.fireball,
        color: '#ff0000',
        fillColor: '#ff4400',
        opacity: 0.8,
        label: `Fireball (${effectRadii.fireball.toFixed(1)}km)`,
        description: 'Everything incinerated',
        className: impactSound ? 'animate-pulse' : ''
      });
    }
    
    // Thermal radiation zone
    if (showEffects.thermal) {
      zones.push({
        radius: effectRadii.thermal,
        color: '#ff6600',
        fillColor: '#ff8800',
        opacity: 0.6,
        label: `Thermal Radiation (${effectRadii.thermal.toFixed(1)}km)`,
        description: 'Third-degree burns, fires'
      });
    }
    
    // Shockwave/Air blast zone
    if (showEffects.shockwave) {
      zones.push({
        radius: effectRadii.shockwave,
        color: '#ffaa00',
        fillColor: '#ffcc00',
        opacity: 0.4,
        label: `Air Blast (${effectRadii.shockwave.toFixed(1)}km)`,
        description: 'Buildings collapse'
      });
    }
    
    // High winds zone
    if (showEffects.winds) {
      zones.push({
        radius: effectRadii.winds,
        color: '#ffdd00',
        fillColor: '#ffee00',
        opacity: 0.3,
        label: `High Winds (${effectRadii.winds.toFixed(1)}km)`,
        description: 'Trees uprooted, debris'
      });
    }
    
    // Seismic effects zone
    if (showEffects.seismic) {
      zones.push({
        radius: effectRadii.seismic,
        color: '#ffff00',
        fillColor: '#ffff99',
        opacity: 0.2,
        label: `Seismic Effects (${effectRadii.seismic.toFixed(1)}km)`,
        description: 'Earthquake damage'
      });
    }
    
    return zones.sort((a, b) => b.radius - a.radius); // Largest first
  };

  const MapEvents = () => {
    useMapEvents({
      click: () => {} // Disable clicking during simulation
    });
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black/90 border border-red-500/50 rounded-lg w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-red-500/30 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">🎬 Impact Simulation</h2>
            <p className="text-gray-300 text-sm">
              Phase: <span className="text-white capitalize">{currentPhase}</span> | 
              Progress: <span className="text-gray-300">{animationProgress.toFixed(0)}%</span>
            </p>
          </div>
        <div className="flex gap-2">
          <Button
              onClick={onClose} 
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
            >
              ← Back to Main
            </Button>
            <Button 
              onClick={onClose} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
            >
              ✕ Exit
          </Button>
        </div>
      </div>

        {/* Enhanced Simulation Controls - Neal.fun style */}
        <div className="p-5 border-b border-orange-500/30 bg-gradient-to-r from-black/50 to-gray-900/50">
          <div className="flex gap-4 items-center mb-3">
            <Button
              onClick={() => {
                setSimulationStep(1);
                setAnimationProgress(0);
                setCurrentPhase('approaching');
                setShowEffects({
                  fireball: false,
                  crater: false,
                  shockwave: false,
                  thermal: false,
                  seismic: false,
                  winds: false
                });
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-2 text-white font-semibold shadow-lg"
              disabled={simulationStep > 0 && animationProgress < 100}
            >
              {simulationStep === 0 ? '🚀 Launch Asteroid' : '⏸️ Running...'}
            </Button>
            
          <Button
              onClick={() => {
                setSimulationStep(0);
                setAnimationProgress(0);
                setCurrentPhase('approaching');
                setShowEffects({
                  fireball: false,
                  crater: false,
                  shockwave: false,
                  thermal: false,
                  seismic: false,
                  winds: false
                });
              }}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-6 py-2 text-white font-semibold shadow-lg"
            >
              🔄 New Impact
          </Button>

            <div className="flex-1 gaming-progress">
              <div 
                className="gaming-progress-fill"
                style={{ width: `${animationProgress}%` }}
              />
            </div>
            
            <div className="text-sm text-gray-300 font-mono min-w-[60px]">
              {animationProgress.toFixed(0)}%
          </div>

            {/* Exit Button */}
        <Button
              onClick={onClose}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 px-4 py-2 text-white font-semibold shadow-lg"
        >
              🏠 Exit
        </Button>
      </div>
      
          {/* Phase Indicators */}
          <div className="flex justify-between text-xs text-gray-400">
            <div className={`flex items-center space-x-1 transition-all duration-300 ${currentPhase === 'approaching' ? 'text-green-400 font-semibold' : ''}`}>
              <span className={`w-2 h-2 rounded-full ${currentPhase === 'approaching' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></span>
              <span>Approach</span>
            </div>
            <div className={`flex items-center space-x-1 transition-all duration-300 ${currentPhase === 'impact' ? 'text-red-400 font-semibold' : ''}`}>
              <span className={`w-2 h-2 rounded-full ${currentPhase === 'impact' ? 'bg-red-400 animate-pulse' : 'bg-gray-600'}`}></span>
              <span>Impact</span>
          </div>
            <div className={`flex items-center space-x-1 transition-all duration-300 ${currentPhase === 'fireball' ? 'text-orange-400 font-semibold' : ''}`}>
              <span className={`w-2 h-2 rounded-full ${currentPhase === 'fireball' ? 'bg-orange-400 animate-pulse' : 'bg-gray-600'}`}></span>
              <span>Fireball</span>
            </div>
            <div className={`flex items-center space-x-1 transition-all duration-300 ${currentPhase === 'effects' ? 'text-yellow-400 font-semibold' : ''}`}>
              <span className={`w-2 h-2 rounded-full ${currentPhase === 'effects' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`}></span>
              <span>Effects</span>
            </div>
            <div className={`flex items-center space-x-1 transition-all duration-300 ${currentPhase === 'aftermath' ? 'text-purple-400 font-semibold' : ''}`}>
              <span className={`w-2 h-2 rounded-full ${currentPhase === 'aftermath' ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`}></span>
              <span>Aftermath</span>
            </div>
          </div>
        </div>

        {/* Main Map Simulation */}
        <div className="relative h-full">
          <MapContainer 
            ref={mapRef}
            center={selectedPosition ? [selectedPosition.latitude, selectedPosition.longitude] : [20, 0]} 
            zoom={6} 
            className="h-full w-full"
            style={{ background: '#0a0a0b' }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />

            {/* Impact Location Marker */}
            {selectedPosition && (
              <Marker position={[selectedPosition.latitude, selectedPosition.longitude]} />
            )}

                  {/* Asteroid Approach Animation - More realistic */}
                  {currentPhase === 'approaching' && selectedPosition && (
                    <>
                      <Circle
                        center={[
                          selectedPosition.latitude + (Math.cos(animationProgress * 0.15) * 5 * (1 - animationProgress / 100)),
                          selectedPosition.longitude + (Math.sin(animationProgress * 0.15) * 5 * (1 - animationProgress / 100))
                        ]}
                        radius={200 + (animationProgress * 5)} // Growing as it approaches
                        pathOptions={{
                          color: '#ffffff',
                          fillColor: '#ff6600',
                          fillOpacity: 0.7 + (animationProgress * 0.003),
                          weight: 3,
                          className: 'animate-pulse'
                        }}
                      />
                      {/* Atmospheric heating trail */}
                      <Circle
                        center={[
                          selectedPosition.latitude + (Math.cos(animationProgress * 0.15) * 5 * (1 - animationProgress / 100)),
                          selectedPosition.longitude + (Math.sin(animationProgress * 0.15) * 5 * (1 - animationProgress / 100))
                        ]}
                        radius={500 + (animationProgress * 10)}
                        pathOptions={{
                          color: '#ffaa00',
                          fillColor: 'transparent',
                          weight: 2,
                          opacity: 0.6,
                          className: 'animate-pulse'
                        }}
                      />
                    </>
                  )}

                  {/* Impact Flash - More dramatic */}
                  {currentPhase === 'impact' && selectedPosition && (
                    <>
                      <Circle
                        center={[selectedPosition.latitude, selectedPosition.longitude]}
                        radius={2000 + (animationProgress * 200)}
                        pathOptions={{
                          color: '#ffffff',
                          fillColor: '#ffffff',
                          fillOpacity: 1.0 - (animationProgress * 0.02),
                          weight: 8,
                          className: 'animate-ping'
                        }}
                      />
                      <Circle
                        center={[selectedPosition.latitude, selectedPosition.longitude]}
                        radius={5000 + (animationProgress * 500)}
                        pathOptions={{
                          color: '#ffff00',
                          fillColor: '#ffaa00',
                          fillOpacity: 0.8 - (animationProgress * 0.015),
                          weight: 5,
                          className: 'animate-pulse'
                        }}
            />
          </>
        )}

                  {/* Realistic Effect Zones */}
                  {selectedPosition && 
                    getRealisticEffectZones().map((zone, index) => (
                      <Circle
                        key={`effect-zone-${index}`}
                        center={[selectedPosition.latitude, selectedPosition.longitude]}
                        radius={zone.radius * 1000} // Convert km to meters for Leaflet
                        pathOptions={{
                          color: zone.color,
                          fillColor: zone.fillColor,
                          fillOpacity: zone.opacity,
                          weight: 2,
                          className: zone.className || ''
                        }}
                      />
                    ))
                  }

                  {/* Expanding Shockwave Rings - More realistic */}
                  {(currentPhase === 'effects' || currentPhase === 'aftermath') && selectedPosition && effectRadii.shockwave &&
                    [1, 2, 3, 4].map((ring) => (
                      <Circle
                        key={`shockwave-${ring}`}
                        center={[selectedPosition.latitude, selectedPosition.longitude]}
                        radius={(effectRadii.shockwave * 1000 * ring * 0.5) + (animationProgress * 2000)}
                        pathOptions={{
                          color: '#ff6600',
                          fillColor: 'transparent',
                          weight: Math.max(1, 5 - ring),
                          opacity: Math.max(0.1, (0.9 - (ring * 0.2)) * (1 - animationProgress / 150)),
                          className: `shockwave-ring-${ring}`
                        }}
                      />
                    ))
                  }

            <MapEvents />
          </MapContainer>

          {/* Enhanced Simulation Info Overlay - Neal.fun style */}
          <div className="absolute top-4 left-4 gaming-card hud-panel circuit-pattern p-5 rounded-lg max-w-md">
            <h3 className="text-orange-400 font-bold text-lg mb-2 hud-font">
              {currentPhase === 'approaching' && '🚀 Asteroid Approaching'}
              {currentPhase === 'impact' && '💥 IMPACT!'}
              {currentPhase === 'fireball' && '🔥 Fireball Expansion'}
              {currentPhase === 'effects' && '🌊 Devastation Spreading'}
              {currentPhase === 'aftermath' && '☁️ Environmental Effects'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">💡 Press ESC or click Exit buttons to return to main app</p>
            
            {currentPhase === 'approaching' && (
              <div className="text-gray-300 text-sm space-y-2">
                <div className="bg-gray-800/50 p-3 rounded">
                  <p className="text-white font-semibold">🌑 Incoming Object</p>
                  <p>• Diameter: <span className="text-white">{impactResults?.parameters?.diameter || 100}m</span></p>
                  <p>• Velocity: <span className="text-white">{(impactResults?.parameters?.velocity || 20000).toLocaleString()} m/s</span></p>
                  <p>• Composition: <span className="text-white">{impactResults?.parameters?.composition || 'Rocky'}</span></p>
                  <p>• Mass: <span className="text-white">{impactResults?.parameters?.mass ? (impactResults.parameters.mass / 1e6).toFixed(1) + ' million kg' : '2.6 million kg'}</span></p>
      </div>
    </div>
            )}

            {currentPhase === 'impact' && (
              <div className="text-gray-300 text-sm space-y-2">
                <div className="bg-red-900/30 p-3 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold">💥 CATASTROPHIC IMPACT!</p>
                  <p>• Energy Released: <span className="text-yellow-400">{impactResults && (impactResults.kinetic_energy / 1e15).toFixed(1)} PJ</span></p>
                  <p>• TNT Equivalent: <span className="text-orange-400">{impactResults && (impactResults.tnt_equivalent / 1e6).toFixed(0)} Megatons</span></p>
                  <p>• Temperature: <span className="text-red-400">~10,000°C</span></p>
                  <p className="text-xs text-gray-400 mt-2">{impactSound && '🔊 Sonic boom traveling...'}</p>
                </div>
              </div>
            )}

            {currentPhase === 'fireball' && (
              <div className="text-gray-300 text-sm space-y-2">
                <div className="bg-orange-900/30 p-3 rounded border border-orange-500/30">
                  <p className="text-orange-400 font-semibold">🔥 Fireball Forming</p>
                  <p>• Crater Radius: <span className="text-red-400">{effectRadii.crater?.toFixed(1)} km</span></p>
                  <p>• Fireball Radius: <span className="text-yellow-400">{effectRadii.fireball?.toFixed(1)} km</span></p>
                  <p>• Peak Temperature: <span className="text-white">8,000°C</span></p>
                  <p>• Everything vaporized within fireball</p>
                </div>
              </div>
            )}

            {currentPhase === 'effects' && (
              <div className="text-gray-300 text-sm space-y-2">
                <div className="bg-yellow-900/30 p-3 rounded border border-yellow-500/30">
                  <p className="text-yellow-400 font-semibold">🌊 Devastation Zones</p>
                  <div className="space-y-1 text-xs">
                    <p>• Thermal Radiation: <span className="text-orange-400">{effectRadii.thermal?.toFixed(1)} km</span> - 3rd degree burns</p>
                    <p>• Air Blast: <span className="text-red-400">{effectRadii.shockwave?.toFixed(1)} km</span> - Buildings collapse</p>
                    <p>• High Winds: <span className="text-yellow-400">{effectRadii.winds?.toFixed(1)} km</span> - Trees uprooted</p>
                    <p>• Seismic: <span className="text-white">{effectRadii.seismic?.toFixed(1)} km</span> - Earthquake damage</p>
                  </div>
                </div>
              </div>
            )}

            {currentPhase === 'aftermath' && (
              <div className="text-gray-300 text-sm space-y-2">
                <div className="bg-purple-900/30 p-3 rounded border border-purple-500/30">
                  <p className="text-purple-400 font-semibold">☁️ Global Effects</p>
                  <p>• Dust Injection: <span className="text-yellow-400">{impactResults?.environmental_effects?.dust_injection || 15}%</span></p>
                  <p>• Climate Impact: <span className="text-white">{impactResults?.environmental_effects?.climate_impact_duration || 2} months</span></p>
                  <p>• Magnitude: <span className="text-red-400">{impactResults?.seismic_magnitude || 6.5}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Regional to global climate disruption</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={onClose} className="space-nav-button px-3 py-2">CLOSE</Button>
                  <Button onClick={onOpen3D} className="space-nav-button px-3 py-2">VIEW 3D VISUALIZATION</Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Damage Statistics - Neal.fun style */}
          <div className="absolute bottom-4 right-4 gaming-card gaming-alert hud-panel p-5 rounded-lg max-w-sm">
            <h3 className="text-red-400 font-bold text-lg mb-3 flex items-center status-font">
              💀 Impact Assessment
            </h3>
             {impactMetrics && (
              <div className="space-y-3">
                {/* Population Statistics */}
                <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                  <p className="text-red-300 font-semibold text-sm mb-1">👥 Human Impact</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">People in Impact Zone:</span>
                       <span className="text-white data-font">{impactMetrics.populationAffected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated Fatalities:</span>
                      <span className="text-red-400 data-font">{impactMetrics.casualties.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Economic Impact */}
                <div className="bg-yellow-900/20 p-3 rounded border border-yellow-500/30">
                  <p className="text-yellow-300 font-semibold text-sm mb-1">💰 Economic Devastation</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Damage:</span>
                       <span className="text-yellow-400 data-font">${impactMetrics.economicDamage.toLocaleString()}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recovery Time:</span>
                      <span className="text-orange-400 data-font">{Math.floor(impactMetrics.economicDamage / 1000)} years</span>
                    </div>
                  </div>
                </div>

                {/* Comparison */}
                <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                  <p className="text-purple-300 font-semibold text-sm mb-1">📊 Scale Comparison</p>
                  <div className="text-xs space-y-1">
                    <p className="text-gray-300">
                      {impactResults && impactResults.tnt_equivalent > 1e9 && "💥 Larger than largest nuclear weapon"}
                      {impactResults && impactResults.tnt_equivalent > 1e6 && impactResults.tnt_equivalent <= 1e9 && "🌆 City-destroying event"}
                      {impactResults && impactResults.tnt_equivalent <= 1e6 && "🏘️ Local devastation"}
                    </p>
                    <p className="text-gray-400">
                      Energy = {impactResults && (impactResults.kinetic_energy / 4.184e15).toFixed(1)} Hiroshima bombs
                    </p>
                  </div>
                </div>

                {/* Quick AI Assessment */}
                 {impactMetrics?.aiAnalysis && (
                  <div className="bg-gray-900/20 p-3 rounded border border-white/30">
                    <p className="text-white font-semibold text-sm mb-1">🤖 AI Assessment</p>
                    <div className="text-xs space-y-1">
                      <Badge className={`text-xs px-2 py-1 ${
                        impactMetrics.aiAnalysis.threatLevel.includes('EXTINCTION') ? 'bg-red-900 text-red-300' :
                        impactMetrics.aiAnalysis.threatLevel.includes('GLOBAL') ? 'bg-red-800 text-red-200' :
                        impactMetrics.aiAnalysis.threatLevel.includes('REGIONAL') ? 'bg-orange-800 text-orange-200' :
                        impactMetrics.aiAnalysis.threatLevel.includes('MAJOR') ? 'bg-yellow-800 text-yellow-200' :
                        'bg-gray-800 text-blue-200'
                      }`}>
                        {impactMetrics.aiAnalysis.threatLevel}
                      </Badge>
                      <p className="text-gray-400 mt-1">
                        View full AI analysis in results section
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Effect Zones Legend */}
          {(currentPhase === 'effects' || currentPhase === 'aftermath') && (
            <div className="absolute bottom-4 left-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 border-white/50 shadow-xl shadow-blue-500/30 p-4 rounded-lg max-w-xs">
              <h3 className="text-white font-bold text-sm mb-3">🎯 Effect Zones Legend</h3>
              <div className="space-y-2 text-xs">
                {getRealisticEffectZones().map((zone, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: zone.fillColor, borderColor: zone.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{zone.label}</p>
                      <p className="text-gray-400 text-xs">{zone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-600">
                <p className="text-gray-400 text-xs">💡 Zones calculated using scientific impact models</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




// Real-Time Impact Dashboard Component
function ImpactDashboard({ impactResults, selectedPosition, impactMetrics }) {
  const [animatedValues, setAnimatedValues] = useState({
    population: 0,
    casualties: 0,
    economicDamage: 0,
    environmentalScore: 0
  });

  // Animate counter values
  useEffect(() => {
    if (!impactResults) return;

     const metrics = impactMetrics;
    if (!metrics) return;

    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3); // Ease-out animation

      setAnimatedValues({
        population: Math.floor(metrics.populationAffected * easeOut),
        casualties: Math.floor(metrics.casualties * easeOut),
        economicDamage: Math.floor(metrics.economicDamage * easeOut),
        environmentalScore: Math.floor(metrics.environmentalScore * easeOut)
      });

      currentStep++;
      if (currentStep > steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [impactResults, selectedPosition, impactMetrics]);

  if (!impactResults) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border-gray-500/30">
        <CardContent className="text-center py-12">
          <p className="text-gray-400">Calculate an impact scenario to see real-time dashboard</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getThreatLevel = (casualties) => {
    if (casualties > 1000000) return { level: 'EXTINCTION', color: 'text-red-500', bg: 'bg-red-500/20' };
    if (casualties > 100000) return { level: 'CATASTROPHIC', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    if (casualties > 10000) return { level: 'SEVERE', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (casualties > 1000) return { level: 'MAJOR', color: 'text-white', bg: 'bg-gray-500/20' };
    return { level: 'MODERATE', color: 'text-green-500', bg: 'bg-green-500/20' };
  };

  const threat = getThreatLevel(animatedValues.casualties);

  return (
    <Card className="bg-black/50 backdrop-blur-sm border-red-500/30">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          📊 Real-Time Impact Dashboard
          <Badge className={`${threat.bg} ${threat.color} font-bold animate-pulse`}>
            {threat.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Counters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-500/30">
            <div className="text-2xl font-bold text-red-400 font-mono">
              {formatNumber(animatedValues.population)}
            </div>
            <div className="text-sm text-gray-300">Population Affected</div>
          </div>
          
          <div className="text-center p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
            <div className="text-2xl font-bold text-orange-400 font-mono">
              {formatNumber(animatedValues.casualties)}
            </div>
            <div className="text-sm text-gray-300">Estimated Casualties</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              ${formatNumber(animatedValues.economicDamage)}M
            </div>
            <div className="text-sm text-gray-300">Economic Damage</div>
 {impactMetrics?.economicBreakdown && (
              <div className="mt-2 text-xs text-gray-400">
                <div>Base: ${formatNumber(impactMetrics.economicBreakdown.baseDamage)}M</div>
                <div>Location: ×{impactMetrics.economicBreakdown.economicMultiplier}</div>
              </div>
            )}
          </div>
          
          <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400 font-mono">
              {animatedValues.environmentalScore}%
            </div>
            <div className="text-sm text-gray-300">Environmental Impact</div>
          </div>
        </div>

        {/* Threat Level Indicator */}
        <div className="p-4 rounded-lg border border-red-500/30 bg-gradient-to-r from-red-900/20 to-orange-900/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 font-medium">Threat Assessment:</span>
            <span className={`font-bold ${threat.color}`}>{threat.level} EVENT</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                threat.level === 'EXTINCTION' ? 'bg-red-500' :
                threat.level === 'CATASTROPHIC' ? 'bg-orange-500' :
                threat.level === 'SEVERE' ? 'bg-yellow-500' :
                threat.level === 'MAJOR' ? 'bg-gray-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (animatedValues.casualties / 1000000) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-white font-bold">{impactResults.seismic_magnitude.toFixed(1)}</div>
            <div className="text-gray-400">Magnitude</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">{(impactResults.crater_diameter/1000).toFixed(1)}km</div>
            <div className="text-gray-400">Crater</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">
              {impactResults.tsunami_risk ? 'HIGH' : 'LOW'}
            </div>
            <div className="text-gray-400">Tsunami Risk</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// Map Provider Configuration (Cleaned up as requested)
const MAP_PROVIDERS = {
  satellite: {
    name: "🛰️ Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    maxZoom: 18
  },
  googlestreets: {
    name: "🏙️ Google Streets",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: '&copy; <a href="https://www.google.com/maps">Google</a>',
    maxZoom: 20
  },
  positron: {
    name: "✨ Light Theme",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20
  }
};

// Enhanced Map component with visual effects and multiple providers
function LocationPicker({ onLocationSelect, selectedPosition, impactResults, mitigationResults, showImpactEffect, showDefenseEffect, isCalculating }) {
  const mapRef = useRef();
  const [currentProvider, setCurrentProvider] = useState('satellite'); // Default to satellite for space app
  
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (!isCalculating) {
          const { lat, lng } = e.latlng;
          onLocationSelect({ latitude: lat, longitude: lng });
          toast.success(`Location selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } else {
          toast.info('⏳ Calculation in progress. Please wait...');
        }
      },
    });
    return null;
  };

  // Calculate crater radius for visualization (scaled down for map display)
  const getCraterRadius = () => {
    if (!impactResults) return 0;
    return Math.min(impactResults.crater_diameter / 2000, 100000); // Scale down and cap at 100km
  };

  // Calculate damage zones
  const getDamageZones = () => {
    if (!impactResults || !selectedPosition) return [];
    
    const baseRadius = getCraterRadius();
    return [
      { radius: baseRadius, color: '#ff0000', opacity: 0.7, label: 'Total Destruction' },
      { radius: baseRadius * 3, color: '#ff4500', opacity: 0.5, label: 'Severe Damage' },
      { radius: baseRadius * 6, color: '#ffa500', opacity: 0.3, label: 'Moderate Damage' },
      { radius: baseRadius * 10, color: '#ffff00', opacity: 0.2, label: 'Light Damage' }
    ];
  };

  // Generate defense trajectory path
  const getDefensePath = () => {
    if (!selectedPosition || !mitigationResults) return [];
    
    // Simulate interceptor path from different angles
    const interceptorStart = {
      lat: selectedPosition.latitude + 5,
      lng: selectedPosition.longitude + 5
    };
    
    return [
      [interceptorStart.lat, interceptorStart.lng],
      [selectedPosition.latitude, selectedPosition.longitude]
    ];
  };

  return (
    <div className="space-y-3">
      {/* Map Provider Selector */}
      <div className="p-3 gaming-card hud-panel cyber-grid rounded-lg">
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-300 font-medium">🗺️ Map Style:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {Object.entries(MAP_PROVIDERS).map(([key, provider]) => (
            <Button
              key={key}
              variant={currentProvider === key ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCurrentProvider(key);
                toast.success(`Switched to ${provider.name} map`);
              }}
              className={`text-xs transition-all duration-200 ${
                currentProvider === key 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg scale-105' 
                  : 'bg-transparent border-purple-500/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/50'
              }`}
            >
              {provider.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-96 w-[90%] mx-auto rounded-lg overflow-hidden border-2 border-purple-500/30">
        <MapContainer 
          ref={mapRef}
          center={[20, 0]} 
          zoom={2} 
          className="h-full w-full"
          style={{ background: currentProvider === 'dark' ? '#0a0a0b' : '#1a1a1a' }}
        >
          <TileLayer
            key={currentProvider} // Force re-render when provider changes
            url={MAP_PROVIDERS[currentProvider].url}
            attribution={MAP_PROVIDERS[currentProvider].attribution}
            maxZoom={MAP_PROVIDERS[currentProvider].maxZoom}
          />
        
        {/* Impact location marker */}
        {selectedPosition && (
          <>
            <Marker position={[selectedPosition.latitude, selectedPosition.longitude]} />
            
            {/* Enhanced Impact effects visualization with animations */}
            {showImpactEffect && impactResults && (
              <>
                {/* Animated shockwave circles */}
                {getDamageZones().map((zone, index) => (
                  <Circle
                    key={`zone-${index}`}
                    center={[selectedPosition.latitude, selectedPosition.longitude]}
                    radius={zone.radius}
                    pathOptions={{
                      color: zone.color,
                      fillColor: zone.color,
                      fillOpacity: zone.opacity,
                      weight: 3,
                      className: 'impact-zone-animation'
                    }}
                  />
                ))}
                
                {/* Expanding shockwave effect */}
                {[1, 2, 3].map((wave) => (
                  <Circle
                    key={`shockwave-${wave}`}
                    center={[selectedPosition.latitude, selectedPosition.longitude]}
                    radius={getCraterRadius() * wave * 2}
                    pathOptions={{
                      color: '#ff0000',
                      fillColor: 'transparent',
                      weight: 4 - wave,
                      opacity: 0.8 - (wave * 0.2),
                      className: `shockwave-${wave}`
                    }}
                  />
                ))}
              </>
            )}
            
            {/* Defense strategy visualization */}
            {showDefenseEffect && mitigationResults && (
              <>
                {/* Interceptor path */}
                <Polyline
                  positions={getDefensePath()}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '10, 10'
                  }}
                />
                
                {/* Defense success zone */}
                <Circle
                  center={[selectedPosition.latitude, selectedPosition.longitude]}
                  radius={50000} // 50km defense radius
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: '#ffffff',
                    fillOpacity: 0.1,
                    weight: 3,
                    dashArray: '5, 5'
                  }}
                />
              </>
            )}
          </>
        )}
        
        <MapEvents />
      </MapContainer>
      </div>
    </div>
  );
}

// Main Application Component
function EarthDefenseApp() {
  const [currentView, setCurrentView] = useState('simulation');
  const [meteorParams, setMeteorParams] = useState({
    diameter: 100,
    velocity: 20000,
    density: 3000,
    angle: 45,
    latitude: 0,
    longitude: 0
  });
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [impactResults, setImpactResults] = useState(null);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [isCalculatingMetrics, setIsCalculatingMetrics] = useState(false);
  
  const [neoData, setNeoData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [neoStats, setNeoStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [calculationStep, setCalculationStep] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    minDiameter: '',
    maxDiameter: '',
    hazardousOnly: false,
    searchTerm: ''
  });
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [mitigationResults, setMitigationResults] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [showImpactEffect, setShowImpactEffect] = useState(false);
  const [showDefenseEffect, setShowDefenseEffect] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [showImpactSimulation, setShowImpactSimulation] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [show3DView, setShow3DView] = useState(false);
  
  // AI API Configuration - Pre-configured for Gemini 2.5 Pro (Advanced)
  const [aiConfig, setAiConfig] = useState({
    provider: 'gemini',
    apiKey: 'AIzaSyABlH4jNjas1pl2XZBSSqEsrge2Y-6enHg',
    model: 'gemini-2.5-pro',
    enabled: true
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [mitigationStrategies, setMitigationStrategies] = useState(null);
  // AI Defense Analysis: Warning Time input state
  const [warningTimeValue, setWarningTimeValue] = useState('');

  // Function to calculate and update impact metrics asynchronously
  const updateImpactMetrics = async (impactResults, selectedPosition, cityName = null) => {
    if (!impactResults || !selectedPosition) {
      setImpactMetrics(null);
      return;
    }

    setIsCalculatingMetrics(true);
    try {
      const metrics = await calculateImpactMetrics(impactResults, selectedPosition, cityName);
      setImpactMetrics(metrics);
    } catch (error) {
      console.error('Error calculating impact metrics:', error);
      setImpactMetrics(null);
    } finally {
      setIsCalculatingMetrics(false);
    }
  };

  useEffect(() => {
    fetchNEOData();
    fetchHistoricalData();
    fetchNEOStats();
    // Try SSE subscription for live updates
    let es;
    try {
      es = new EventSource(`${API}/neo/stream`);
      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg?.type === 'neo_update' && Array.isArray(msg.data)) {
            setNeoData(msg.data);
          }
        } catch {}
      };
      es.onerror = () => {
        // If SSE fails, it will fall back to polling only
      };
    } catch {}
    return () => {
      if (es && typeof es.close === 'function') es.close();
    };
  }, []);

  // Update impact metrics when impact results or selected position changes
  useEffect(() => {
    if (impactResults && selectedPosition) {
      updateImpactMetrics(impactResults, selectedPosition);
    }
  }, [impactResults, selectedPosition]);

  const fetchNEOData = async () => {
    try {
      console.log('Fetching NEO data from:', `${API}/neo/current`);
      const response = await axios.get(`${API}/neo/current`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('NEO data fetched successfully:', response.data);
      setNeoData(response.data);
      toast.success(`Loaded ${response.data.length} current near-Earth objects`);
      
    } catch (error) {
      console.error('Error fetching NEO data:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.log('Backend not available, no fallback data available');
        toast.error('🔧 Backend not available. Please check server connection.');
        setNeoData([]);
      } else if (error.response?.status === 500) {
        console.log('NASA API error, no fallback data available');
        toast.error('⚠️ NASA API temporarily unavailable. Please try again later.');
        setNeoData([]);
      } else if (error.response?.status === 429) {
        console.log('Rate limited, no fallback data available');
        toast.error('⏱️ NASA API rate limited. Please try again later.');
        setNeoData([]);
      } else {
        console.log('Unknown error, no fallback data available');
        toast.error('📡 Live tracking temporarily unavailable. Please try again later.');
        setNeoData([]);
      }
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`${API}/neo/historical`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      setHistoricalData(response.data);
      toast.success(`Loaded ${response.data.length} historical impact events`);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.warning('Historical data unavailable');
    }
  };

  const fetchCloseApproaches = async () => {
    try {
      const response = await axios.get(`${API}/neo/close-approaches?limit=20&max_distance=1000000`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      console.log('Close approaches fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching close approaches:', error);
      return [];
    }
  };

  const simulateHistoricalImpact = async (impactId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/impact/simulate-historical/${impactId}`, {}, {
        timeout: 15000,
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('Historical impact simulation:', response.data);
      
      // Display simulation results in a modal or detailed view
      const simulation = response.data;
      const results = simulation.simulation_results;
      
      toast.success(`Simulated ${simulation.historical_event.name} impact!`, {
        duration: 5000,
        description: `Energy: ${(results.tnt_equivalent / 1000000).toFixed(1)} MT TNT, Crater: ${results.crater_diameter.toFixed(0)}m`
      });
      
      // You could set this to state to show detailed results
      return simulation;
      
    } catch (error) {
      console.error('Error simulating historical impact:', error);
      toast.error('Failed to simulate historical impact');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchNEOStats = async () => {
    try {
      const response = await axios.get(`${API}/neo/stats`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      setNeoStats(response.data);
    } catch (error) {
      console.error('Error fetching NEO stats:', error);
    }
  };

  const searchNEOObjects = async () => {
    try {
      setLoading(true);
      const filters = {
        min_diameter: searchFilters.minDiameter ? parseFloat(searchFilters.minDiameter) : null,
        max_diameter: searchFilters.maxDiameter ? parseFloat(searchFilters.maxDiameter) : null,
        potentially_hazardous_only: searchFilters.hazardousOnly,
        search_term: searchFilters.searchTerm || null
      };
      
      const response = await axios.post(`${API}/neo/search`, filters, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      setNeoData(response.data);
      toast.success(`Found ${response.data.length} objects matching criteria`);
    } catch (error) {
      console.error('Error searching NEO objects:', error);
      toast.error('Search failed. Using current data.');
    } finally {
      setLoading(false);
    }
  };

  const syncNEOData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/neo/sync`, {}, {
        timeout: 30000,
        headers: { 'Accept': 'application/json' }
      });
      
      toast.success(response.data.message);
      await fetchNEOData(); // Refresh the data
      await fetchNEOStats(); // Update stats
    } catch (error) {
      console.error('Error syncing NEO data:', error);
      toast.error('Sync failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (position) => {
    // Validate position data
    if (!position || typeof position.latitude !== 'number' || typeof position.longitude !== 'number') {
      console.error('Invalid position data:', position);
      toast.error('Invalid location selected. Please try again.');
      return;
    }
    
    // Ensure latitude and longitude are valid numbers
    const lat = Number(position.latitude);
    const lng = Number(position.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates:', position);
      toast.error('Invalid coordinates. Please try again.');
      return;
    }
    
    const validatedPosition = {
      latitude: lat,
      longitude: lng
    };
    
    setSelectedPosition(validatedPosition);
    setMeteorParams({
      ...meteorParams,
      latitude: lat,
      longitude: lng
    });
    setShowImpactEffect(false);
    setShowDefenseEffect(false);
  };

  const handleManualLocationInput = async (locationString) => {
    setManualLocation(locationString);
    
    // Try to parse coordinates (lat, lng format)
    const coordMatch = locationString.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
    if (coordMatch) {
      const latitude = parseFloat(coordMatch[1]);
      const longitude = parseFloat(coordMatch[2]);
      
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        handleLocationSelect({ latitude, longitude });
        toast.success(`Location set to: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        return;
      }
    }
    
    // For now, we'll keep it simple - in a full implementation, you'd use geocoding API
    toast.info('Please enter coordinates in format: "latitude, longitude" (e.g., "40.7128, -74.0060")');
  };

  const resetCalculation = () => {
    setImpactResults(null);
    setMitigationStrategies(null);
    setAiAnalysis(null);
    setAiError(null);
    setShowImpactEffect(false);
    setShowDefenseEffect(false);
    setScreenShake(false);
    setCalculationProgress(0);
    setCalculationStep('');
    toast.info('🔄 Ready for new calculation');
  };

  const calculateImpact = async () => {
    if (!selectedPosition) {
      toast.error('Please select an impact location on the map');
      return;
    }

    console.log('Starting impact calculation...');
    console.log('Selected Position:', selectedPosition);
    console.log('Asteroid Parameters:', meteorParams);
    console.log('API URL:', `${API}/impact/calculate`);
    
    // Validate parameters before sending
    if (!meteorParams.diameter || !meteorParams.velocity || !meteorParams.density) {
      toast.error('Please fill in all meteor parameters (diameter, velocity, density)');
      return;
    }
    
    if (meteorParams.diameter <= 0 || meteorParams.velocity <= 0 || meteorParams.density <= 0) {
      toast.error('All meteor parameters must be positive values');
      return;
    }

    setLoading(true);
    setIsCalculating(true);
    setCalculationProgress(0);
    setCalculationStep('Initializing calculation...');
    
    try {
      // Step 1: Prepare request
      setCalculationProgress(10);
      setCalculationStep('Preparing impact parameters...');
      await new Promise(resolve => setTimeout(resolve, 200)); // Smooth transition
      
      // Step 2: Send request
      setCalculationProgress(30);
      setCalculationStep('Calculating impact effects...');
      
      // Check if API endpoint is reachable first
      console.log('Attempting to connect to backend...');
      
      const response = await axios.post(`${API}/impact/calculate`, meteorParams, {
        timeout: 15000, // Increased timeout for better reliability
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Step 3: Process results
      setCalculationProgress(70);
      setCalculationStep('Processing results...');
      await new Promise(resolve => setTimeout(resolve, 300)); // Smooth transition
      
      console.log('Impact calculation response:', response.data);
      setImpactResults(response.data);
      
      // Step 4: Skip auto AI analysis (user will trigger manually)
      setCalculationProgress(90);
      setCalculationStep('Finalizing results...');
      
      // Step 5: Complete
      setCalculationProgress(100);
      setCalculationStep('Calculation complete!');
      await new Promise(resolve => setTimeout(resolve, 500)); // Final smooth transition
      
      toast.success('Impact scenario calculated successfully!');
      
      // Show impact effects on map after a short delay with screen shake
      setTimeout(() => {
        setShowImpactEffect(true);
        setScreenShake(true);
        toast.info('💥 Impact effects visualized on map!');
        
        // Remove screen shake after animation
        setTimeout(() => setScreenShake(false), 500);
      }, 1000);
    } catch (error) {
      console.error('Detailed error information:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.log('Backend not available, cannot calculate impact');
        toast.error('🔧 Backend server not available. Please check server connection.');
        
        // No fallback data - require backend connection
        setImpactResults(null);
        setMitigationStrategies(null);
        
        // No success message for failed backend connection
        
        // Show impact effects on map after a short delay with screen shake
        setTimeout(() => {
          setShowImpactEffect(true);
          setScreenShake(true);
          toast.info('💥 Impact effects visualized on map!');
          
          // Remove screen shake after animation
          setTimeout(() => setScreenShake(false), 500);
        }, 1000);
        
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Check if the backend server is properly configured.');
      } else if (error.response?.status >= 400 && error.response?.status < 500) {
        toast.error(`Client error: ${error.response?.data?.detail || error.message}`);
      } else if (error.response?.status >= 500) {
        toast.error(`Server error: ${error.response?.data?.detail || 'Internal server error'}`);
      } else {
        toast.error(`Failed to calculate impact: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setIsCalculating(false);
      setCalculationProgress(0);
      setCalculationStep('');
    }
  };

  const simulateMitigation = async (strategyType) => {
    if (!impactResults) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/mitigation/simulate?impact_id=${impactResults.id}&strategy_type=${strategyType}`
      );
      setMitigationResults(response.data);
      setSelectedStrategy(strategyType);
      toast.success(`${strategyType} simulation completed!`);
      
      // Show defense effects on map
      setTimeout(() => {
        setShowDefenseEffect(true);
        toast.info('🛡️ Defense strategy visualized on map!');
      }, 1000);
    } catch (error) {
      console.error('Error simulating mitigation:', error);
      toast.error('Failed to simulate mitigation strategy');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden space-command-center ${screenShake ? 'screen-shake' : ''}`}>
      
      {/* Enhanced Space Background with Grid Overlay */}
      <SpaceBackground />
      <div className="space-grid-overlay"></div>
      
      {/* Enhanced Starfield Particle Effects */}
      <div className="space-particle" style={{top: '10%', left: '20%', animationDelay: '0s'}}></div>
      <div className="space-particle" style={{top: '30%', left: '80%', animationDelay: '2s'}}></div>
      <div className="space-particle" style={{top: '60%', left: '10%', animationDelay: '4s'}}></div>
      <div className="space-particle" style={{top: '80%', left: '70%', animationDelay: '6s'}}></div>
      <div className="space-particle" style={{top: '25%', left: '50%', animationDelay: '1s'}}></div>
      <div className="space-particle" style={{top: '45%', left: '30%', animationDelay: '3s'}}></div>
      <div className="space-particle" style={{top: '65%', left: '90%', animationDelay: '5s'}}></div>
      <div className="space-particle" style={{top: '85%', left: '40%', animationDelay: '7s'}}></div>
      
      {/* Additional Starfield Layers */}
      <div className="space-particle" style={{top: '15%', left: '60%', animationDelay: '0.5s', width: '1px', height: '1px'}}></div>
      <div className="space-particle" style={{top: '35%', left: '15%', animationDelay: '2.5s', width: '1px', height: '1px'}}></div>
      <div className="space-particle" style={{top: '55%', left: '85%', animationDelay: '4.5s', width: '1px', height: '1px'}}></div>
      <div className="space-particle" style={{top: '75%', left: '25%', animationDelay: '6.5s', width: '1px', height: '1px'}}></div>
      <div className="space-particle" style={{top: '95%', left: '55%', animationDelay: '8.5s', width: '1px', height: '1px'}}></div>
      
      {/* Header */}
      <div className="relative z-10 text-center py-12 space-station-panel">
        <h1 
          className="mb-4 ethnocentric-gradient"
          data-testid="main-heading"
        >
          WANT TO DEFEND THE EARTH ?
        </h1>
        <p 
          className="text-xl md:text-2xl gaming-subtitle eurostile-subtitle max-w-4xl mx-auto px-4"
        >
          UNLEASH YOURSELF AND DIVE INTO THE METEOR WORLD TO EXPAND YOUR KNOWLEDGE WITH OUR PROJECT "ANNIHILATE-METEOR"!
        </p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <Tabs value={currentView} onValueChange={setCurrentView} className="w-full space-station-panel">
          <TabsList className="grid w-full grid-cols-3 space-station-panel border border-white/30 rounded-lg p-1">
            <TabsTrigger 
              value="simulation" 
              className="space-nav-button data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white transition-colors font-medium"
              data-testid="simulation-tab"
            >
              🎯 IMPACT SIMULATION
            </TabsTrigger>
            <TabsTrigger 
              value="tracking" 
              className="space-nav-button data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white transition-colors font-medium"
              data-testid="tracking-tab"
            >
              🪨 HISTORICAL METEORS
            </TabsTrigger>
            <TabsTrigger 
              value="game" 
              className="space-nav-button data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white transition-colors font-medium"
              data-testid="game-tab"
            >
              🛡️ EARTH DEFENDER
            </TabsTrigger>
          </TabsList>

          {/* Impact Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Parameters Input - Takes 1/3 of the space */}
              <Card className="space-mission-card" data-testid="parameters-card">
                <CardHeader>
                  <CardTitle className="gaming-card-title text-lg">🛸 METEOR PARAMETERS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Diameter (m)</label>
                      <Input
                        type="number"
                        value={meteorParams.diameter}
                        onChange={(e) => {
                          if (!isCalculating) {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              setMeteorParams({...meteorParams, diameter: value});
                              console.log('Diameter updated:', value);
                            }
                          }
                        }}
                        disabled={isCalculating}
                        className={`space-data-display ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-testid="diameter-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Velocity (m/s)</label>
                      <Input
                        type="number"
                        value={meteorParams.velocity}
                        onChange={(e) => {
                          if (!isCalculating) {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              setMeteorParams({...meteorParams, velocity: value});
                              console.log('Velocity updated:', value);
                            }
                          }
                        }}
                        disabled={isCalculating}
                        className={`space-data-display ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-testid="velocity-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Density (kg/m³)</label>
                      <Input
                        type="number"
                        value={meteorParams.density}
                        onChange={(e) => {
                          if (!isCalculating) {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              setMeteorParams({...meteorParams, density: value});
                              console.log('Density updated:', value);
                            }
                          }
                        }}
                        disabled={isCalculating}
                        className={`space-data-display ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-testid="density-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Impact Angle (°)</label>
                      <Input
                        type="number"
                        value={meteorParams.angle}
                        onChange={(e) => {
                          if (!isCalculating) {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 90) {
                              setMeteorParams({...meteorParams, angle: value});
                              console.log('Angle updated:', value);
                            }
                          }
                        }}
                        disabled={isCalculating}
                        className={`space-data-display ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-testid="angle-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Manual Location Input</label>
                    
                    {/* Manual location input */}
                    <div className="mb-3">
                      <Input
                        type="text"
                        placeholder="Enter coordinates (e.g., 40.7128, -74.0060) or click map"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleManualLocationInput(manualLocation);
                          }
                        }}
                        className="bg-black/30 border-purple-500/30 text-white placeholder-gray-400"
                        data-testid="manual-location-input"
                      />
                      <Button
                        onClick={() => handleManualLocationInput(manualLocation)}
                        className="mt-2 w-full bg-gradient-to-r from-gray-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        data-testid="set-location-btn"
                      >
                        Set Location
                      </Button>
                    </div>
                    
                    {selectedPosition && selectedPosition.latitude !== undefined && selectedPosition.longitude !== undefined && (
                      <div className="p-3 bg-gray-800/50 rounded-lg border border-white/30">
                        <div className="text-sm text-gray-300">
                          <div className="font-semibold text-white mb-1">📍 Selected Location:</div>
                          <div>Latitude: {selectedPosition.latitude.toFixed(4)}°</div>
                          <div>Longitude: {selectedPosition.longitude.toFixed(4)}°</div>
                          {selectedPosition.city && (
                            <div className="text-blue-300 mt-1">🏙️ {selectedPosition.city}, {selectedPosition.country}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                  {isCalculating && (
                    <div className="bg-gray-900/90 border border-white/30 rounded-lg p-6 text-center backdrop-blur-smooth pulse-glow">
                      <div className="text-white font-semibold mb-3 text-lg">🔄 CALCULATION IN PROGRESS</div>
                      <div className="text-gray-300 text-sm mb-4">{calculationStep}</div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full progress-bar-smooth"
                          style={{ width: `${calculationProgress}%` }}
                        ></div>
                      </div>
                      
                      {/* Progress Percentage */}
                      <div className="text-white font-mono text-sm mb-3">
                        {calculationProgress}%
                      </div>
                      
                      {/* Animated Spinner */}
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="text-gray-400 text-xs mt-3">
                        Processing your impact scenario...
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={impactResults ? resetCalculation : calculateImpact} 
                    disabled={loading || isCalculating}
                      className="w-full space-nav-button font-medium py-2 px-4"
                    data-testid="calculate-impact-btn"
                  >
                    {loading || isCalculating ? 'CALCULATING...' : 
                     impactResults ? 'NEW CALCULATION' : 'CALCULATE IMPACT'}
                  </Button>

                    {/* Visualize Impact Button - appears after calculation */}
                    {impactResults && selectedPosition && (
                      <Button
                        onClick={() => {
                          setShowImpactSimulation(true);
                          setSimulationStep(0);
                          toast.info('🎬 Starting impact simulation...');
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold animate-pulse"
                        data-testid="visualize-impact-btn"
                      >
                        🎬 Visualize Impact Simulation
                      </Button>
                    )}

                  {impactResults && selectedPosition && (
                    <Button
                      onClick={() => {
                        setShowImpactSimulation(false);
                        setSimulationStep(0);
                        setShow3DView(true);
                        toast.info('🛰️ Opening 3D Impact Simulation...');
                      }}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold"
                    >
                      🛰️ 3D Impact Simulation
                    </Button>
                  )}
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Map - Takes 2/3 of the space */}
              <Card className="space-mission-card xl:col-span-2">
                <CardHeader>
                  <CardTitle className="gaming-card-title text-lg">🗺️ IMPACT LOCATION SELECTOR</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96 w-[90%] mx-auto">
                    <LocationPicker 
                      onLocationSelect={handleLocationSelect} 
                      selectedPosition={selectedPosition}
                      impactResults={impactResults}
                      mitigationResults={mitigationResults}
                      showImpactEffect={showImpactEffect}
                      showDefenseEffect={showDefenseEffect}
                      isCalculating={isCalculating}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-Time Dashboard */}
            <div className="mt-6">
              <ImpactDashboard 
                impactResults={impactResults} 
                selectedPosition={selectedPosition} 
                impactMetrics={impactMetrics}
              />
            </div>
            
            {/* Results Section */}
            {impactResults && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="gaming-card gaming-alert hud-panel" data-testid="impact-results">
                  <CardHeader>
                    <CardTitle className="text-white heading-font">💥 Impact Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Kinetic Energy</p>
                        <p className="text-white font-bold">{formatNumber(impactResults.kinetic_energy)} J</p>
                      </div>
                      <div>
                        <p className="text-gray-400">TNT Equivalent</p>
                        <p className="text-white font-bold">{formatNumber(impactResults.tnt_equivalent)} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Crater Diameter</p>
                        <p className="text-white font-bold">{formatNumber(impactResults.crater_diameter)} m</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Seismic Magnitude</p>
                        <p className="text-white font-bold">{impactResults.seismic_magnitude.toFixed(1)}</p>
                      </div>
                    </div>
                    
                    {impactResults.tsunami_risk && (
                      <Alert className="border-red-500/50 bg-red-500/10">
                        <AlertDescription className="text-red-400">
                          ⚠️ High tsunami risk detected for ocean impact!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600/30">
                      <p className="text-white font-semibold mb-3">Environmental Effects</p>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200">Atmospheric Impact:</span>
                          <span className="text-orange-300 font-medium capitalize bg-orange-900/30 px-2 py-1 rounded">
                            {impactResults.environmental_effects.atmospheric_disturbance}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200">Biodiversity Threat:</span>
                          <span className="text-red-300 font-medium capitalize bg-red-900/30 px-2 py-1 rounded">
                            {impactResults.environmental_effects.biodiversity_threat}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200">Climate Impact Duration:</span>
                          <span className="text-yellow-300 font-medium bg-yellow-900/30 px-2 py-1 rounded">
                            {impactResults.environmental_effects.climate_impact_duration.toFixed(1)} months
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200">Dust Injection:</span>
                          <span className="text-purple-300 font-medium bg-purple-900/30 px-2 py-1 rounded">
                            {impactResults.environmental_effects.dust_injection.toFixed(1)}% sunlight blocked
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200">Ejecta Volume:</span>
                          <span className="text-white font-medium bg-gray-900/30 px-2 py-1 rounded">
                            {formatNumber(impactResults.environmental_effects.ejecta_volume)} m³
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200">Thermal Radiation:</span>
                          <span className="text-red-300 font-medium bg-red-900/30 px-2 py-1 rounded">
                            {formatNumber(impactResults.environmental_effects.thermal_radiation)} km²
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                
                
                {/* Combined Environmental & Economic Analysis */}
                <Card className="gaming-card hud-panel holographic-display">
                  <CardHeader>
                    <CardTitle className="text-white heading-font">🌍 Environmental & Economic Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Environmental Section */}
                    <div className="space-y-3">
                      <h3 className="text-green-400 font-bold text-lg mb-3">🌍 Environmental Effects</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Climate Impact Duration:</span>
                        <span className="text-yellow-400 font-bold">
                          {impactResults.environmental_effects.climate_impact_duration.toFixed(1)} months
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${Math.min(100, impactResults.environmental_effects.climate_impact_duration * 10)}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-gray-900/30 rounded border border-white/30">
                          <div className="text-white font-bold">
                            {formatNumber(impactResults.environmental_effects.ejecta_volume)} m³
                          </div>
                          <div className="text-gray-400">Ejecta Volume</div>
                        </div>
                        
                        <div className="p-3 bg-orange-900/30 rounded border border-orange-500/30">
                          <div className="text-orange-400 font-bold">
                            {formatNumber(impactResults.environmental_effects.thermal_radiation)} km²
                          </div>
                          <div className="text-gray-400">Thermal Area</div>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded border ${
                        impactResults.environmental_effects.biodiversity_threat === 'extinction' 
                          ? 'bg-red-900/30 border-red-500/30' 
                          : impactResults.environmental_effects.biodiversity_threat === 'severe'
                          ? 'bg-orange-900/30 border-orange-500/30'
                          : 'bg-yellow-900/30 border-yellow-500/30'
                      }`}>
                        <div className="text-center">
                          <div className={`font-bold text-lg ${
                            impactResults.environmental_effects.biodiversity_threat === 'extinction' 
                              ? 'text-red-400' 
                              : impactResults.environmental_effects.biodiversity_threat === 'severe'
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                          }`}>
                            {impactResults.environmental_effects.biodiversity_threat.toUpperCase()}
                          </div>
                          <div className="text-gray-300 text-sm">Biodiversity Threat Level</div>
                        </div>
                      </div>
                    </div>

                    {/* Economic Section */}
                    {impactMetrics?.economicBreakdown && (
                      <div className="space-y-3">
                        <h3 className="text-yellow-400 font-bold text-lg mb-3">💰 Economic Damage Breakdown</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-yellow-900/20 rounded border border-yellow-500/20">
                            <div className="text-yellow-300 font-bold">${formatNumber(impactMetrics.economicBreakdown.baseDamage)}M</div>
                            <div className="text-gray-400">Base Impact Damage</div>
                            <div className="text-xs text-gray-500 mt-1">From TNT equivalent energy</div>
                          </div>
                          
                          <div className="p-3 bg-gray-900/20 rounded border border-white/20">
                            <div className="text-white font-bold">×{impactMetrics.economicBreakdown.economicMultiplier}</div>
                            <div className="text-gray-400">Location Factor</div>
                            <div className="text-xs text-gray-500 mt-1">Economic center proximity</div>
                          </div>
                          
                          <div className="p-3 bg-green-900/20 rounded border border-green-500/20">
                            <div className="text-green-300 font-bold">×{impactMetrics.economicBreakdown.infrastructureFactor}</div>
                            <div className="text-gray-400">Infrastructure</div>
                            <div className="text-xs text-gray-500 mt-1">Population density based</div>
                          </div>
                          
                          <div className="p-3 bg-purple-900/20 rounded border border-purple-500/20">
                            <div className="text-purple-300 font-bold">×{impactMetrics.economicBreakdown.areaScalingFactor}</div>
                            <div className="text-gray-400">Area Scaling</div>
                            <div className="text-xs text-gray-500 mt-1">Network effects</div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-500/30">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">
                               ${formatNumber(impactMetrics.economicDamage)}M USD
                            </div>
                            <div className="text-gray-300 text-sm mt-1">Total Estimated Economic Damage</div>
                            <div className="text-xs text-gray-500 mt-2">
                              Includes direct infrastructure damage, business disruption, and recovery costs
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* AI Impact Analysis */}
                 {impactResults && selectedPosition && impactMetrics?.aiAnalysis && (
                  <Card className="gaming-card hud-panel holographic-display">
                    <CardHeader>
                      <CardTitle className="text-white heading-font flex items-center gap-2">
                        🤖 AI Impact Analysis
                        <Badge className="gaming-badge text-xs">
                           {impactMetrics.aiAnalysis.confidence} Confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                         const analysis = impactMetrics.aiAnalysis;
                        return (
                          <div className="space-y-4">
                            {/* Threat Level Badge */}
                            <div className="text-center">
                              <Badge className={`px-4 py-2 text-lg font-bold ${
                                analysis.threatLevel.includes('EXTINCTION') ? 'bg-black border-red-500 text-red-400' :
                                analysis.threatLevel.includes('GLOBAL') ? 'bg-red-900/50 border-red-400 text-red-300' :
                                analysis.threatLevel.includes('REGIONAL') ? 'bg-orange-900/50 border-orange-400 text-orange-300' :
                                analysis.threatLevel.includes('MAJOR') ? 'bg-yellow-900/50 border-yellow-400 text-yellow-300' :
                                analysis.threatLevel.includes('SIGNIFICANT') ? 'bg-gray-900/50 border-white text-white' :
                                'bg-green-900/50 border-green-400 text-green-300'
                              } animate-pulse`}>
                                ⚠️ {analysis.threatLevel}
                              </Badge>
                            </div>

                            {/* AI Explanation */}
                            <div className="bg-gray-900/10 p-4 rounded border border-white/30">
                              <h4 className="text-white font-semibold mb-2 hud-font">🧠 Expert Analysis</h4>
                              <p className="text-gray-300 text-sm leading-relaxed">{analysis.explanation}</p>
                            </div>

                            {/* Historical Comparison */}
                            <div className="bg-purple-900/10 p-4 rounded border border-purple-500/30">
                              <h4 className="text-purple-300 font-semibold mb-2 hud-font">📚 Historical Context</h4>
                              <p className="text-gray-300 text-sm">{analysis.comparison}</p>
                            </div>

                            {/* Expected Consequences */}
                            <div className="bg-red-900/10 p-4 rounded border border-red-500/30">
                              <h4 className="text-red-300 font-semibold mb-2 hud-font">💥 Expected Consequences</h4>
                              <ul className="text-gray-300 text-sm space-y-1">
                                {analysis.consequences.map((consequence, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">•</span>
                                    <span>{consequence}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* AI Recommendations */}
                            <div className="bg-green-900/10 p-4 rounded border border-green-500/30">
                              <h4 className="text-green-300 font-semibold mb-2 hud-font"><span className="emoji-white">🛡️</span> AI Recommendations</h4>
                              <ul className="text-gray-300 text-sm space-y-1">
                                {analysis.recommendations.map((recommendation, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">▶</span>
                                    <span>{recommendation}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}


                {/* AI Defense Analysis - Only */}
                {impactResults && (
                  <Card className="gaming-card hud-panel holographic-display">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white heading-font text-lg"><span className="emoji-white">🤖</span> AI Defense Analysis</CardTitle>
                        <Button
                          onClick={async () => {
                            setAiLoading(true);
                            setAiError(null);
                            try {
                              if (warningTimeValue !== '') {
                                const v = parseFloat(warningTimeValue);
                                if (isNaN(v) || v <= 0) {
                                  toast.warning('Warning Time should be a positive number');
                                  setAiLoading(false);
                                  return;
                                }
                              }

                              // Pre-check calculations for AI context
                              // Units: diameter (m), density (kg/m^3), velocity (m/s)
                              const diameterMeters = Number(impactResults?.diameter ?? meteorParams.diameter);
                              const densityKgPerM3 = Number(impactResults?.density ?? meteorParams.density);
                              const velocityMps = Number(impactResults?.velocity ?? meteorParams.velocity);

                              const radiusMeters = diameterMeters / 2; // m
                              const volumeM3 = (4 / 3) * Math.PI * Math.pow(radiusMeters, 3); // m^3
                              const massKg = volumeM3 * densityKgPerM3; // kg
                              const kineticEnergyJoules = 0.5 * massKg * Math.pow(velocityMps, 2); // J

                              // Δv estimation: assume 1 Earth radius lateral displacement target over warning time
                              // This is a simplistic placeholder; user can refine later
                              let deltaVRequiredMps = undefined;
                              if (warningTimeValue !== '') {
                                const warningYears = parseFloat(warningTimeValue);
                                if (!isNaN(warningYears) && warningYears > 0) {
                                  const seconds = warningYears * 365.25 * 24 * 3600; // convert years -> seconds
                                  const requiredLateralMeters = 6_371_000; // ~1 Earth radius in meters
                                  deltaVRequiredMps = requiredLateralMeters / seconds; // m/s
                                }
                              }

                              const result = await generateAIAnalysis(
                                {
                                  ...aiConfig,
                                  warningTime: warningTimeValue !== '' ? `${warningTimeValue}` : undefined,
                                  computedMassKg: Number.isFinite(massKg) ? massKg : undefined,
                                  computedKineticEnergyJ: Number.isFinite(kineticEnergyJoules) ? kineticEnergyJoules : undefined,
                                  computedDeltaV_mps: Number.isFinite(deltaVRequiredMps) ? deltaVRequiredMps : undefined
                                },
                                {
                                  ...impactResults,
                                  // Provide computed values alongside physical inputs to AI builder
                                  _ai_massKg: Number.isFinite(massKg) ? massKg : undefined,
                                  _ai_kineticEnergyJ: Number.isFinite(kineticEnergyJoules) ? kineticEnergyJoules : undefined,
                                  _ai_deltaV_mps: Number.isFinite(deltaVRequiredMps) ? deltaVRequiredMps : undefined,
                                  _ai_warningTimeYears: warningTimeValue !== '' ? parseFloat(warningTimeValue) : undefined
                                }
                              );
                              setAiAnalysis(result.analysis);
                              toast.success('🤖 AI analysis generated successfully!');
                            } catch (error) {
                              console.error('AI Analysis Error:', error);
                              setAiError(error.message);
                              toast.error('Failed to generate AI analysis');
                            } finally {
                              setAiLoading(false);
                            }
                          }}
                          disabled={aiLoading}
                          className="bg-gradient-to-r from-gray-600 to-gray-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold px-3 py-1 text-sm"
                        >
                          {aiLoading ? '🔄 Analyzing...' : 'Generate'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Warning Time input */}
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Warning Time (years)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.0000001"
                            value={warningTimeValue}
                            onChange={(e) => {
                              const v = e.target.value;
                              // allow empty for optional, else ensure > 0
                              if (v === '') { setWarningTimeValue(v); return; }
                              const n = parseFloat(v);
                              if (!isNaN(n) && n > 0) {
                                setWarningTimeValue(v);
                              }
                            }}
                            placeholder="Enter warning time before impact"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                      </div>
                      {aiError && (
                        <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                          <div className="text-center">
                            <h4 className="text-red-400 font-bold text-lg mb-2">❌ AI Analysis Error</h4>
                            <p className="text-red-300 text-sm mb-2">{aiError}</p>
                            <p className="text-gray-400 text-xs">
                              Please check that the AI API server is running on port 5001 and try again.
                            </p>
                          </div>
                        </div>
                      )}

                      {aiAnalysis ? (
                        <div className="mt-4 p-3 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg border border-white/30">
                          <div className="text-center mb-3">
                            <h4 className="text-white font-bold text-base mb-1">🤖 AI Defense Analysis</h4>
                            <p className="text-gray-400 text-xs">AI-generated analysis with scientific sources</p>
                          </div>
                          <div className="space-y-3">
                            {aiAnalysis.raw_content ? (
                              <div className="bg-slate-800/30 p-3 rounded border border-slate-600/30">
                                <h5 className="text-slate-300 font-semibold mb-1 text-sm">AI Response:</h5>
                                <div className="text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">{aiAnalysis.raw_content}</div>
                              </div>
                            ) : (
                              <>
                                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-4 rounded border border-white/30 mb-4">
                                  <h4 className="text-white font-bold text-lg mb-3 text-center">🎯 Defense Strategy Success Rates</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {aiAnalysis.kineticImpactor?.success_rate && (
                                      <div className="text-center">
                                        <div className="text-white font-semibold">🚀 Kinetic Impactor</div>
                                        <div className="text-blue-100 text-2xl font-bold">{aiAnalysis.kineticImpactor.success_rate}</div>
                                        <div className="text-xs text-white">Proven Technology</div>
                                      </div>
                                    )}
                                    {aiAnalysis.gravityTractor?.success_rate && (
                                      <div className="text-center">
                                        <div className="text-purple-300 font-semibold">🛰️ Gravity Tractor</div>
                                        <div className="text-purple-100 text-2xl font-bold">{aiAnalysis.gravityTractor.success_rate}</div>
                                        <div className="text-xs text-purple-400">Long Lead Time</div>
                                      </div>
                                    )}
                                    {aiAnalysis.nuclearDevice?.success_rate && (
                                      <div className="text-center">
                                        <div className="text-red-300 font-semibold">💥 Nuclear Device</div>
                                        <div className="text-red-100 text-2xl font-bold">{aiAnalysis.nuclearDevice.success_rate}</div>
                                        <div className="text-xs text-red-400">High Fragmentation Risk</div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {aiAnalysis.kineticImpactor && (
                                  <div className="p-3 bg-gray-900/10 rounded border border-white/20">
                                    <h5 className="text-white font-semibold mb-2">🚀 Kinetic Impactor Analysis</h5>
                                    <div className="text-sm text-gray-300 space-y-2">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Favorability:</span>
                                            <Badge className={`${aiAnalysis.kineticImpactor.favorability === 'high' ? 'bg-green-900 text-green-300' : aiAnalysis.kineticImpactor.favorability === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>{aiAnalysis.kineticImpactor.favorability?.toUpperCase() || 'UNKNOWN'}</Badge>
                                          </div>
                                          {aiAnalysis.kineticImpactor.success_rate && (
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400">Success Rate:</span>
                                              <Badge className="bg-gray-900 text-white text-lg font-bold px-3 py-1">{aiAnalysis.kineticImpactor.success_rate}</Badge>
                                            </div>
                                          )}
                                        </div>
                                        {aiAnalysis.kineticImpactor.success_rate && (
                                          <div className="bg-gray-900/20 border border-white/30 rounded p-2">
                                            <div className="text-center">
                                              <span className="text-white font-semibold">Proven Success Rate: </span>
                                              <span className="text-blue-100 text-xl font-bold">{aiAnalysis.kineticImpactor.success_rate}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <p>{aiAnalysis.kineticImpactor.analysis}</p>
                                      <p className="text-white"><strong>Reasoning:</strong> {aiAnalysis.kineticImpactor.reasoning}</p>
                                      {aiAnalysis.kineticImpactor.pros && (
                                        <div>
                                          <strong className="text-green-400">Advantages:</strong>
                                          <ul className="list-disc list-inside ml-2 text-xs">
                                            {aiAnalysis.kineticImpactor.pros.map((pro, index) => (
                                              <li key={index}>{pro}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {aiAnalysis.kineticImpactor.cons && (
                                        <div>
                                          <strong className="text-red-400">Disadvantages:</strong>
                                          <ul className="list-disc list-inside ml-2 text-xs">
                                            {aiAnalysis.kineticImpactor.cons.map((con, index) => (
                                              <li key={index}>{con}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {aiAnalysis.gravityTractor && (
                                  <div className="p-3 bg-purple-900/10 rounded border border-purple-500/20">
                                    <h5 className="text-purple-400 font-semibold mb-2">🛰️ Gravity Tractor Analysis</h5>
                                    <div className="text-sm text-gray-300 space-y-2">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Favorability:</span>
                                            <Badge className={`${aiAnalysis.gravityTractor.favorability === 'high' ? 'bg-green-900 text-green-300' : aiAnalysis.gravityTractor.favorability === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>{aiAnalysis.gravityTractor.favorability?.toUpperCase() || 'UNKNOWN'}</Badge>
                                          </div>
                                          {aiAnalysis.gravityTractor.success_rate && (
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400">Success Rate:</span>
                                              <Badge className="bg-purple-900 text-purple-300 text-lg font-bold px-3 py-1">{aiAnalysis.gravityTractor.success_rate}</Badge>
                                            </div>
                                          )}
                                        </div>
                                        {aiAnalysis.gravityTractor.success_rate && (
                                          <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2">
                                            <div className="text-center">
                                              <span className="text-purple-300 font-semibold">Proven Success Rate: </span>
                                              <span className="text-purple-100 text-xl font-bold">{aiAnalysis.gravityTractor.success_rate}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <p>{aiAnalysis.gravityTractor.analysis}</p>
                                      <p className="text-purple-300"><strong>Reasoning:</strong> {aiAnalysis.gravityTractor.reasoning}</p>
                                      {aiAnalysis.gravityTractor.pros && (
                                        <div>
                                          <strong className="text-green-400">Advantages:</strong>
                                          <ul className="list-disc list-inside ml-2 text-xs">
                                            {aiAnalysis.gravityTractor.pros.map((pro, index) => (
                                              <li key={index}>{pro}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {aiAnalysis.gravityTractor.cons && (
                                        <div>
                                          <strong className="text-red-400">Disadvantages:</strong>
                                          <ul className="list-disc list-inside ml-2 text-xs">
                                            {aiAnalysis.gravityTractor.cons.map((con, index) => (
                                              <li key={index}>{con}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {aiAnalysis.nuclearDevice && (
                                  <div className="p-3 bg-red-900/10 rounded border border-red-500/20">
                                    <h5 className="text-red-400 font-semibold mb-2">💥 Nuclear Device Analysis</h5>
                                    <div className="text-sm text-gray-300 space-y-2">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Favorability:</span>
                                            <Badge className={`${aiAnalysis.nuclearDevice.favorability === 'high' ? 'bg-green-900 text-green-300' : aiAnalysis.nuclearDevice.favorability === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>{aiAnalysis.nuclearDevice.favorability?.toUpperCase() || 'UNKNOWN'}</Badge>
                                          </div>
                                          {aiAnalysis.nuclearDevice.success_rate && (
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400">Success Rate:</span>
                                              <Badge className="bg-red-900 text-red-300 text-lg font-bold px-3 py-1">{aiAnalysis.nuclearDevice.success_rate}</Badge>
                                            </div>
                                          )}
                                        </div>
                                        {aiAnalysis.nuclearDevice.success_rate && (
                                          <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                                            <div className="text-center">
                                              <span className="text-red-300 font-semibold">Theoretical Success Rate: </span>
                                              <span className="text-red-100 text-xl font-bold">{aiAnalysis.nuclearDevice.success_rate}</span>
                                              <div className="text-xs text-red-400 mt-1">⚠️ High fragmentation risk</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <p>{aiAnalysis.nuclearDevice.analysis}</p>
                                      <p className="text-red-300"><strong>Reasoning:</strong> {aiAnalysis.nuclearDevice.reasoning}</p>
                                      {aiAnalysis.nuclearDevice.pros && (
                                        <div>
                                          <strong className="text-green-400">Advantages:</strong>
                                          <ul className="list-disc list-inside ml-2 text-xs">
                                            {aiAnalysis.nuclearDevice.pros.map((pro, index) => (
                                              <li key={index}>{pro}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {aiAnalysis.nuclearDevice.cons && (
                                        <div>
                                          <strong className="text-red-400">Disadvantages:</strong>
                                          <ul className="list-disc list-inside ml-2 text-xs">
                                            {aiAnalysis.nuclearDevice.cons.map((con, index) => (
                                              <li key={index}>{con}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {aiAnalysis.sources && aiAnalysis.sources.length > 0 && (
                                  <div className="p-4 bg-gradient-to-r from-slate-900/30 to-gray-900/30 rounded border border-slate-500/30">
                                    <h5 className="text-slate-400 font-bold mb-3">📚 AI-Generated Sources</h5>
                                    <div className="space-y-2">
                                      {aiAnalysis.sources.map((source, index) => (
                                        <div key={index} className="p-2 bg-slate-800/20 rounded border border-slate-600/20">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <h6 className="text-slate-300 font-semibold text-sm">{source.title}</h6>
                                              <p className="text-xs text-gray-400 capitalize">{source.type}</p>
                                            </div>
                                            {source.url && (
                                              <a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-white hover:text-white text-xs underline">Visit Source</a>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg border border-white/30">
                          <div className="text-center">
                            <h4 className="text-white font-bold text-lg mb-2">🤖 AI Defense Analysis</h4>
                            <p className="text-gray-400 text-sm mb-4">Configure AI settings above to generate intelligent analysis</p>
                            <div className="text-xs text-gray-500">AI analysis will provide dynamic explanations, real scientific sources, and personalized recommendations based on your specific impact parameters.</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

              </div>
            )}
          </TabsContent>

          {/* Defense Strategies Tab */}
          {/* Defense Strategies Tab removed */}

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {true && (
            <>
            {/* Enhanced Status Header */}
            <Card className="space-station-panel">
              <CardHeader>
                <CardTitle className="gaming-hud flex items-center gap-2">
                  🛰️ ESA NEOCC Near-Earth Objects
                  <Badge className={`${neoData.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {neoData.length > 0 ? `${neoData.length} Objects Tracked` : 'Loading...'}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={syncNEOData}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    🔄 Sync ESA Data
                  </Button>
                  <Button
                    onClick={fetchHistoricalData}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    📚 Historical
                  </Button>
                  <Button
                    onClick={async () => {
                      const closeApproaches = await fetchCloseApproaches();
                      if (closeApproaches.length > 0) {
                        toast.success(`Found ${closeApproaches.length} close approaches`);
                        // You could set this to a state variable to display separately
                      }
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    🎯 Close Approaches
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {neoData.filter(neo => !neo.potentially_hazardous).length}
                    </div>
                    <div className="text-gray-400">Safe Objects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">
                      {neoData.filter(neo => neo.potentially_hazardous).length}
                    </div>
                    <div className="text-gray-400">Potentially Hazardous</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {neoData.length > 0 ? Math.min(...neoData.map(neo => Math.round(neo.miss_distance / 1000))).toLocaleString() : '---'}
                    </div>
                    <div className="text-gray-400">Closest (1000 km)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {neoData.length > 0 ? Math.max(...neoData.map(neo => Math.round((neo.diameter_min + neo.diameter_max) / 2))).toLocaleString() : '---'}
                    </div>
                    <div className="text-gray-400">Largest (m)</div>
                  </div>
                </div>
                
                {/* Database Stats */}
                {neoStats.total_objects > 0 && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-2">Database Statistics</div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-white">{neoStats.total_objects}</div>
                        <div className="text-gray-500">Total in DB</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-400">{neoStats.potentially_hazardous}</div>
                        <div className="text-gray-500">Hazardous in DB</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-400">{neoStats.recent_updates_24h}</div>
                        <div className="text-gray-500">Updated 24h</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search and Filter Controls */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 border-yellow-400/40 shadow-lg shadow-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-lg">🔍 Search & Filter Objects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Min Diameter (m)</label>
                    <input
                      type="number"
                      value={searchFilters.minDiameter}
                      onChange={(e) => setSearchFilters({...searchFilters, minDiameter: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Max Diameter (m)</label>
                    <input
                      type="number"
                      value={searchFilters.maxDiameter}
                      onChange={(e) => setSearchFilters({...searchFilters, maxDiameter: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Search Term</label>
                    <input
                      type="text"
                      value={searchFilters.searchTerm}
                      onChange={(e) => setSearchFilters({...searchFilters, searchTerm: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      placeholder="Object name or ID"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={searchFilters.hazardousOnly}
                        onChange={(e) => setSearchFilters({...searchFilters, hazardousOnly: e.target.checked})}
                        className="mr-2"
                      />
                      Hazardous Only
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={searchNEOObjects}
                    disabled={loading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    🔍 Search
                  </Button>
                  <Button
                    onClick={() => {
                      setSearchFilters({minDiameter: '', maxDiameter: '', hazardousOnly: false, searchTerm: ''});
                      fetchNEOData();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    🔄 Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* NEO Objects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {neoData.map((neo) => (
                <Card key={neo.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 border-yellow-400/40 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:border-yellow-400/60 transition-all duration-300" data-testid={`neo-${neo.id}`}>
                  <CardHeader>
                    <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
                      🌑 {neo.name}
                    {neo.potentially_hazardous && (
                        <Badge className="gaming-badge animate-pulse">
                          ⚠️ PHA
                      </Badge>
                    )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Diameter:</span>
                        <span className="text-white font-mono">{neo.diameter_min.toFixed(0)} - {neo.diameter_max.toFixed(0)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Velocity:</span>
                        <span className="text-white font-mono">{(neo.velocity / 1000).toFixed(1)} km/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Miss Distance:</span>
                        <span className="text-white font-mono">{formatNumber(neo.miss_distance)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Close Approach:</span>
                        <span className="text-white">{new Date(neo.close_approach_date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 p-2 rounded bg-gray-800/50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Risk Level:</span>
                          <span className={`text-xs font-bold ${
                            neo.potentially_hazardous ? 'text-red-400' : 
                            neo.miss_distance < 3000000 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {neo.potentially_hazardous ? 'HIGH' : 
                             neo.miss_distance < 3000000 ? 'MEDIUM' : 'LOW'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-400">Size Category:</span>
                          <span className="text-xs text-white">
                            {((neo.diameter_min + neo.diameter_max) / 2) > 150 ? 'Large' :
                             ((neo.diameter_min + neo.diameter_max) / 2) > 50 ? 'Medium' : 'Small'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setMeteorParams({
                          ...meteorParams,
                          diameter: (neo.diameter_min + neo.diameter_max) / 2,
                          velocity: neo.velocity
                        });
                        setCurrentView('simulation');
                        toast.success(`Loaded ${neo.name} for impact simulation`);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                      data-testid={`load-${neo.id}-btn`}
                    >
                      🎯 Simulate Impact
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {neoData.length === 0 && (
              <Card className="bg-black/50 backdrop-blur-sm border-gray-500/30">
                <CardContent className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400 mb-2">Loading current near-Earth objects...</p>
                  <p className="text-xs text-gray-500">Fetching data from NASA JPL database</p>
                </CardContent>
              </Card>
            )}

            {/* Hidden live tracking UI end */}
            </>
            )}

            {/* Historical Impacts Section */}
            {historicalData.length > 0 && (
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 border-purple-400/40 shadow-lg shadow-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-400 text-lg">📚 Historical Impact Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historicalData.map((impact) => (
                      <div key={impact.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                        <div className="text-lg font-bold text-purple-400 mb-2 flex items-center justify-between">
                          {impact.name}
                          <Badge className={`text-xs ${
                            impact.impact_type === 'extinction_event' ? 'bg-red-500/20 text-red-400' :
                            impact.impact_type === 'crater' ? 'bg-orange-500/20 text-orange-400' :
                            impact.impact_type === 'airburst' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-white'
                          }`}>
                            {impact.impact_type?.replace('_', ' ').toUpperCase() || 'IMPACT'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div><span className="text-gray-500">Date:</span> {impact.date}</div>
                          <div><span className="text-gray-500">Location:</span> {impact.location}</div>
                          <div><span className="text-gray-500">Size:</span> {impact.diameter_estimate}m</div>
                          <div><span className="text-gray-500">Energy:</span> {impact.energy_release} MT TNT</div>
                          {impact.casualties > 0 && (
                            <div><span className="text-gray-500">Casualties:</span> {impact.casualties}</div>
                          )}
                          {impact.damage_radius && (
                            <div><span className="text-gray-500">Damage Radius:</span> {impact.damage_radius}km</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 mb-3">{impact.description}</div>
                        
                        {/* Simulate Impact Button */}
                        <Button
                          onClick={() => simulateHistoricalImpact(impact.id)}
                          disabled={loading}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2"
                        >
                          🎯 Simulate Impact
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center gap-2">
              <Button
                onClick={fetchNEOData}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                🔄 Refresh Tracking Data
              </Button>
              <Button
                onClick={fetchNEOStats}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                📊 Update Stats
              </Button>
            </div>
          </TabsContent>

          {/* Game Tab */}
          <TabsContent value="game" className="space-y-6">
            <Card className="space-mission-card">
              <CardHeader>
                <CardTitle className="gaming-card-title text-lg">🛡️ EARTH DEFENDER</CardTitle>
              </CardHeader>
              <CardContent>
                <GameSaveEarth />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Impact Simulation Modal */}
      {showImpactSimulation && impactResults && selectedPosition && (
        <ImpactSimulation
          impactResults={impactResults}
          selectedPosition={selectedPosition}
          impactMetrics={impactMetrics}
          simulationStep={simulationStep}
          setSimulationStep={setSimulationStep}
          onClose={() => {
            setShowImpactSimulation(false);
            setSimulationStep(0);
          }}
          onOpen3D={() => {
            setShowImpactSimulation(false);
            setSimulationStep(0);
            setShow3DView(true);
          }}
        />
      )}

      {show3DView && (
        <EarthImpact3D onClose={() => setShow3DView(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EarthDefenseApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
