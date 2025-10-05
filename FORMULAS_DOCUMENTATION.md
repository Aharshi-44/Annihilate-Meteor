# 🧮 Mathematical Formulas Used in ANNIHILATE-METEOR Project

This document provides a comprehensive list of all mathematical formulas and calculations used throughout the ANNIHILATE-METEOR planetary defense simulation platform.

## 📊 Table of Contents

1. [Basic Physics Formulas](#basic-physics-formulas)
2. [Impact Calculations](#impact-calculations)
3. [Crater Formation](#crater-formation)
4. [Environmental Effects](#environmental-effects)
5. [Seismic Calculations](#seismic-calculations)
6. [Mitigation Strategies](#mitigation-strategies)
7. [Population and Economic Impact](#population-and-economic-impact)
8. [3D Visualization Mathematics](#3d-visualization-mathematics)
9. [Constants and Parameters](#constants-and-parameters)

---

## 🔬 Basic Physics Formulas

### 1. Asteroid Mass Calculation
**Location**: `backend/server.py:189-193`

```python
def calculate_asteroid_mass(diameter: float, density: float) -> float:
    radius = diameter / 2
    volume = (4/3) * π * (radius³)
    return volume * density
```

**Formula**: `m = (4/3) × π × r³ × ρ`

Where:
- `m` = mass (kg)
- `r` = radius (m) = diameter/2
- `ρ` = density (kg/m³)
- `π` = 3.14159...

### 2. Kinetic Energy Calculation
**Location**: `backend/server.py:195-197`

```python
def calculate_kinetic_energy(mass: float, velocity: float) -> float:
    return 0.5 * mass * (velocity²)
```

**Formula**: `KE = ½ × m × v²`

Where:
- `KE` = kinetic energy (Joules)
- `m` = mass (kg)
- `v` = velocity (m/s)

### 3. TNT Equivalent Conversion
**Location**: `backend/server.py:98`

```python
TNT_EQUIVALENT = 4.184e9  # J/kg for TNT conversion
```

**Formula**: `TNT_equivalent = KE / 4.184e9`

Where:
- `TNT_equivalent` = equivalent mass of TNT (kg)
- `KE` = kinetic energy (Joules)

---

## 💥 Impact Calculations

### 4. Effective Impact Velocity
**Location**: `backend/server.py:224-225`

```python
theta = max(1e-3, min(89.9, float(impact_angle_deg))) * π / 180.0
v_eff = max(1.0, float(velocity) * sin(theta))
```

**Formula**: `v_eff = v × sin(θ)`

Where:
- `v_eff` = effective velocity normal to surface (m/s)
- `v` = impact velocity (m/s)
- `θ` = impact angle (degrees, converted to radians)

### 5. Energy Scaling for Effects
**Location**: `frontend/src/App.js:525-529`

```javascript
const craterRadius = Math.pow(energy / 1e15, 0.25) * 0.5;
const fireballRadius = Math.pow(energy / 1e15, 0.4) * 2;
const thermalRadius = Math.pow(energy / 1e15, 0.33) * 10;
const shockwaveRadius = Math.pow(energy / 1e15, 0.25) * 25;
const seismicRadius = Math.pow(energy / 1e15, 0.2) * 100;
const windRadius = Math.pow(energy / 1e15, 0.3) * 50;
```

**Formulas**:
- `R_crater = 0.5 × (E/10¹⁵)^0.25`
- `R_fireball = 2 × (E/10¹⁵)^0.4`
- `R_thermal = 10 × (E/10¹⁵)^0.33`
- `R_shockwave = 25 × (E/10¹⁵)^0.25`
- `R_seismic = 100 × (E/10¹⁵)^0.2`
- `R_wind = 50 × (E/10¹⁵)^0.3`

Where:
- `E` = kinetic energy (Joules)
- `R` = radius of effect zone (km)

---

## 🕳️ Crater Formation

### 6. Pi-Scaling Crater Formation (Holsapple Model)
**Location**: `backend/server.py:218-243`

```python
# Dimensionless gravity scaling
pi2 = (g * a) / (v_eff²)

# Density effect
density_factor = (rho_p / rho_t)^(1/3)

# Transient crater diameter
D_transient = K1 * a * (pi2^(-mu)) * density_factor

# Final crater diameter
D_final = 1.3 * D_transient
depth = D_final / 7.0
```

**Formulas**:
- `π₂ = (g × a) / v_eff²` (gravity scaling parameter)
- `density_factor = (ρ_p / ρ_t)^(1/3)` (density coupling)
- `D_transient = K₁ × a × π₂^(-μ) × density_factor`
- `D_final = 1.3 × D_transient`
- `depth = D_final / 7`

Where:
- `g` = gravitational acceleration (9.81 m/s²)
- `a` = projectile radius (m)
- `K₁` = empirical constant (1.5)
- `μ` = scaling exponent (0.22)
- `ρ_p` = projectile density (kg/m³)
- `ρ_t` = target density (kg/m³)

### 7. Fallback Energy-Based Crater Scaling
**Location**: `backend/server.py:246-249`

```python
energy_mt = energy / (4.184e15)
diameter = 1000 * (energy_mt^0.25)
depth = diameter / 7
```

**Formula**: `D = 1000 × (E_MT)^0.25`

Where:
- `D` = crater diameter (m)
- `E_MT` = energy in megatons TNT

---

## 🌍 Environmental Effects

### 8. Environmental Impact Calculations
**Location**: `backend/server.py:282-291`

```python
effects = {
    "ejecta_volume": crater_diameter³ * 0.1,
    "dust_injection": min(100, energy_mt * 0.1),
    "thermal_radiation": energy_mt * 1000,
    "climate_impact_duration": max(1, log10(energy_mt)) if energy_mt > 1 else 0
}
```

**Formulas**:
- `V_ejecta = D³ × 0.1` (ejecta volume)
- `dust_% = min(100, E_MT × 0.1)` (dust injection percentage)
- `A_thermal = E_MT × 1000` (thermal radiation area in km²)
- `T_climate = max(1, log₁₀(E_MT))` (climate impact duration in months)

### 9. Tsunami Risk Assessment
**Location**: `backend/server.py:264-276`

```python
energy_mt = energy / (4.184e15)
is_ocean = (abs(lat) < 60 and -180 <= lon <= 180) and 
           not (30 <= lat <= 70 and -10 <= lon <= 40)
return is_ocean and energy_mt > 1
```

**Formula**: `tsunami_risk = is_ocean AND (E_MT > 1)`

Where:
- `is_ocean` = boolean based on latitude/longitude
- `E_MT` = energy in megatons TNT

---

## 🌊 Seismic Calculations

### 10. Seismic Magnitude Estimation
**Location**: `backend/server.py:257-262`

```python
def calculate_seismic_magnitude(energy: float) -> float:
    magnitude = log10(energy) - 11.8
    return max(0, magnitude)
```

**Formula**: `M = log₁₀(E) - 11.8`

Where:
- `M` = seismic magnitude (Richter scale)
- `E` = impact energy (Joules)

---

## 🛡️ Mitigation Strategies

### 11. Deflection Distance Calculation
**Location**: `backend/server.py:339`

```python
deflection_km = strategy.velocity_change * strategy.lead_time * 365 * 24 * 3600 / 1000
```

**Formula**: `d = Δv × t × 365 × 24 × 3600 / 1000`

Where:
- `d` = deflection distance (km)
- `Δv` = velocity change (m/s)
- `t` = lead time (years)

### 12. Risk Reduction Calculation
**Location**: `backend/server.py:356`

```python
risk_reduction = strategy.success_probability * min(100, deflection_km / 100)
```

**Formula**: `R_reduction = P_success × min(100, d/100)`

Where:
- `R_reduction` = risk reduction percentage
- `P_success` = success probability (0-1)
- `d` = deflection distance (km)

---

## 👥 Population and Economic Impact

### 13. Distance Calculation (Haversine-like)
**Location**: `frontend/src/App.js:198-199`

```javascript
const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
```

**Formula**: `d = √[(lat₁ - lat₂)² + (lng₁ - lng₂)²]`

### 14. Population Density Factor
**Location**: `frontend/src/App.js:206`

```javascript
const distanceFactor = Math.max(0.1, 1 - (minDistance / 50));
const estimatedPopulation = Math.floor(nearestCity.pop * distanceFactor);
```

**Formula**: `P_estimated = P_city × max(0.1, 1 - d/50)`

Where:
- `P_estimated` = estimated population
- `P_city` = nearest city population
- `d` = distance to nearest city

### 15. Economic Impact Calculation
**Location**: `frontend/src/App.js:254-255`

```javascript
const distanceDecay = Math.max(0.1, 1 - (distance / 10));
economicMultiplier = city.factor * distanceDecay;
```

**Formula**: `E_multiplier = factor × max(0.1, 1 - d/10)`

### 16. Infrastructure Density Factor
**Location**: `frontend/src/App.js:260`

```javascript
const infrastructureFactor = Math.min(3.0, 1 + (popData.density / 1000));
```

**Formula**: `I_factor = min(3.0, 1 + ρ/1000)`

Where:
- `I_factor` = infrastructure factor
- `ρ` = population density (people/km²)

### 17. Area Scaling Factor
**Location**: `frontend/src/App.js:263`

```javascript
const areaScalingFactor = Math.min(2.0, 1 + Math.log10(affectedArea / 1000));
```

**Formula**: `A_factor = min(2.0, 1 + log₁₀(A/1000))`

Where:
- `A_factor` = area scaling factor
- `A` = affected area (km²)

### 18. Casualty Rate Calculation
**Location**: `frontend/src/App.js:462`

```javascript
casualties: Math.floor(Math.min(popData.population, affectedArea * popData.density) * 0.7)
```

**Formula**: `C = min(P_total, A × ρ) × 0.7`

Where:
- `C` = casualties
- `P_total` = total population
- `A` = affected area (km²)
- `ρ` = population density (people/km²)

---

## 🎮 3D Visualization Mathematics

### 19. Meteor Trail Effect
**Location**: `frontend/src/components/EarthImpact3D.jsx:32-37`

```javascript
if (enableEffects) {
    trailRef.current.unshift(ref.current.position.clone());
    if (trailRef.current.length > 20) trailRef.current.pop();
}
```

**Formula**: `trail_length = min(20, current_length)`

### 20. Meteor Shape Noise
**Location**: `frontend/src/components/EarthImpact3D.jsx:54-56`

```javascript
const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
const scale = 1 + (noise - 0.5) * 0.35;
const v2 = n.multiplyScalar(0.5 * scale);
```

**Formula**: `scale = 1 + (noise - 0.5) × 0.35`

Where:
- `noise` = pseudo-random value (0-1)
- `scale` = vertex scaling factor

### 21. Earth Rotation Animation
**Location**: `frontend/src/components/EarthImpact3D.jsx:87-89`

```javascript
useFrame((_, delta) => {
    if (ref.current) {
        ref.current.rotation.y += delta * 0.02;
    }
});
```

**Formula**: `θ(t) = θ₀ + 0.02 × Δt`

Where:
- `θ(t)` = rotation angle at time t
- `Δt` = time delta (seconds)

### 22. Impact Detection Distance
**Location**: `frontend/src/components/EarthImpact3D.jsx:22-29`

```javascript
const dx = ref.current.position.x - targetPosition[0];
const dy = ref.current.position.y - targetPosition[1];
const dz = ref.current.position.z - targetPosition[2];
const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
if (dist < 1.2) {
    onImpact?.(ref.current.position.clone());
}
```

**Formula**: `d = √[(x₁-x₂)² + (y₁-y₂)² + (z₁-z₂)²]`

### 23. Crater Position Calculation
**Location**: `frontend/src/components/EarthImpact3D.jsx:171-174`

```javascript
const direction = impactPos.clone().normalize();
const craterPos = direction.multiplyScalar(3.02);
```

**Formula**: `P_crater = (P_impact / |P_impact|) × 3.02`

Where:
- `P_crater` = crater position on Earth surface
- `P_impact` = impact position
- `3.02` = Earth radius + small offset

---

## 📐 Constants and Parameters

### 24. Physical Constants
**Location**: `backend/server.py:95-98`

```python
EARTH_RADIUS = 6371000  # meters
EARTH_MASS = 5.972e24   # kg
G = constants.G         # gravitational constant
TNT_EQUIVALENT = 4.184e9  # J/kg for TNT conversion
```

**Values**:
- `R_Earth` = 6,371,000 m
- `M_Earth` = 5.972 × 10²⁴ kg
- `G` = 6.674 × 10⁻¹¹ m³/kg·s²
- `TNT_energy` = 4.184 × 10⁹ J/kg

### 25. Crater Formation Constants
**Location**: `backend/server.py:229-231`

```python
mu = 0.22  # scaling exponent
K1 = 1.5   # empirical constant
```

### 26. Environmental Scaling Constants
**Location**: `frontend/src/App.js:525-529`

```javascript
// Effect radius scaling factors
crater: 0.5,      // km per (PJ)^0.25
fireball: 2,      // km per (PJ)^0.4
thermal: 10,      // km per (PJ)^0.33
shockwave: 25,    // km per (PJ)^0.25
seismic: 100,     // km per (PJ)^0.2
wind: 50          // km per (PJ)^0.3
```

---

## 🔬 Scientific References

### Impact Scaling Laws
- **Holsapple-Schmidt scaling** for crater formation
- **Gutenberg-Richter relationship** for seismic magnitude
- **Energy scaling laws** for blast effects

### Atmospheric Entry Physics
- **Effective velocity** calculation for oblique impacts
- **Density coupling** in crater formation
- **Gravity scaling** for large impacts

### Environmental Impact Models
- **Dust injection** atmospheric effects
- **Thermal radiation** scaling
- **Seismic wave** propagation

---

## 📊 Formula Summary by Category

| Category | Number of Formulas | Key Applications |
|----------|-------------------|------------------|
| Basic Physics | 3 | Mass, energy, TNT conversion |
| Impact Calculations | 2 | Effective velocity, energy scaling |
| Crater Formation | 2 | Pi-scaling, energy-based |
| Environmental Effects | 4 | Dust, thermal, climate, tsunami |
| Seismic Calculations | 1 | Magnitude estimation |
| Mitigation Strategies | 2 | Deflection, risk reduction |
| Population/Economic | 6 | Distance, density, casualties |
| 3D Visualization | 5 | Animation, collision detection |
| Constants | 3 | Physical constants, scaling factors |

**Total: 28 Mathematical Formulas**

---

## 🎯 Usage Notes

1. **Units**: All formulas use SI units unless otherwise specified
2. **Precision**: Floating-point calculations with appropriate rounding
3. **Validation**: Input validation prevents division by zero and negative values
4. **Fallbacks**: Multiple calculation methods for robustness
5. **Scaling**: Formulas adapted for different impact sizes and scenarios

This comprehensive formula documentation ensures the scientific accuracy and reproducibility of the ANNIHILATE-METEOR simulation platform. 🛡️

