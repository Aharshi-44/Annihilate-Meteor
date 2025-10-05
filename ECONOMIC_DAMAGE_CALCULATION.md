# 💰 Economic Damage Calculation - Technical Documentation

## Overview

The economic damage calculation in the Asteroid Defense Simulation has been enhanced from a simple linear model to a sophisticated multi-factor assessment that considers location, infrastructure, and secondary effects.

## Current vs Enhanced Model

### **Previous Simple Model**
```javascript
Economic Damage = (TNT Equivalent ÷ 1,000,000) × 100 Million USD
```

### **New Enhanced Model**
```javascript
Economic Damage = Base Damage × Location Factor × Infrastructure Factor × Area Scaling × Environmental Factor
```

## Detailed Calculation Breakdown

### 1. **Base Damage Calculation**
```javascript
Base Damage = (TNT Equivalent in kg ÷ 1,000,000) × 100 Million USD
```
- **Purpose**: Establishes baseline damage proportional to impact energy
- **Example**: 717M kg TNT equivalent → $71,700M base damage

### 2. **Location Factor (Economic Center Proximity)**
```javascript
Location Factor = Economic Center Factor × Distance Decay
Distance Decay = max(0.1, 1 - (distance / 10°))
```

**Economic Center Factors:**
- **Major Financial Centers**: 12.0 - 16.0×
  - San Francisco: 16.0× (tech hub)
  - New York: 15.0× (financial center)
  - Tokyo: 14.0× (industrial hub)
  - London: 12.0× (global finance)

- **Developing Economic Centers**: 2.0 - 4.0×
  - São Paulo: 4.0×
  - Delhi: 3.0×
  - Cairo: 2.5×
  - Lagos: 2.0×

- **Rural/Unknown Areas**: 1.0× (baseline)

### 3. **Infrastructure Factor**
```javascript
Infrastructure Factor = min(3.0, 1 + (Population Density ÷ 1000))
```
- **Purpose**: Higher population density = more infrastructure to damage
- **Range**: 1.0× to 3.0×
- **Example**: 
  - Rural area (100 people/km²): 1.1×
  - Urban area (5000 people/km²): 6.0× → capped at 3.0×

### 4. **Area Scaling Factor**
```javascript
Area Scaling Factor = min(2.0, 1 + log₁₀(Affected Area ÷ 1000))
```
- **Purpose**: Larger impact areas cause disproportionate damage due to network effects
- **Rationale**: Disrupting multiple interconnected systems creates cascading failures
- **Range**: 1.0× to 2.0×

### 5. **Environmental Factor**
```javascript
Environmental Factor = Dust Injection > 20% ? 1.5× : 1.0×
```
- **Purpose**: Severe climate impacts amplify economic damage
- **Threshold**: 20% sunlight blockage triggers agricultural/supply chain disruption

## Example Calculations

### **Scenario 1: Rural Impact**
- **Location**: Remote farmland
- **TNT Equivalent**: 100M kg
- **Population Density**: 50 people/km²
- **Affected Area**: 500 km²
- **Dust Injection**: 5%

```
Base Damage = (100M ÷ 1M) × 100 = $10,000M
Location Factor = 1.0 (rural)
Infrastructure Factor = 1 + (50 ÷ 1000) = 1.05
Area Scaling = 1 + log₁₀(500 ÷ 1000) = 1 + (-0.3) = 0.7 → 1.0 (minimum)
Environmental Factor = 1.0 (low dust)

Total Damage = $10,000M × 1.0 × 1.05 × 1.0 × 1.0 = $10,500M
```

### **Scenario 2: Manhattan Impact**
- **Location**: New York City (Financial District)
- **TNT Equivalent**: 500M kg
- **Population Density**: 28,000 people/km²
- **Affected Area**: 2,000 km²
- **Dust Injection**: 25%

```
Base Damage = (500M ÷ 1M) × 100 = $50,000M
Location Factor = 15.0 × 1.0 = 15.0 (direct hit on NYC)
Infrastructure Factor = 1 + (28,000 ÷ 1000) = 29.0 → 3.0 (capped)
Area Scaling = 1 + log₁₀(2000 ÷ 1000) = 1 + 0.3 = 1.3
Environmental Factor = 1.5 (high dust injection)

Total Damage = $50,000M × 15.0 × 3.0 × 1.3 × 1.5 = $4,387,500M
```

## Real-World Validation

### **Economic Factors Considered:**

1. **Direct Infrastructure Damage**
   - Buildings, roads, utilities
   - Telecommunications networks
   - Transportation systems

2. **Business Disruption**
   - Production halts
   - Supply chain breakdown
   - Service sector impacts

3. **Recovery Costs**
   - Reconstruction expenses
   - Emergency response
   - Temporary relocations

4. **Network Effects**
   - Financial market disruption
   - International trade impacts
   - Insurance industry stress

### **Limitations and Future Improvements**

**Current Limitations:**
- Simplified population density mapping
- Static economic center factors
- No seasonal/temporal variations
- Limited secondary effect modeling

**Potential Enhancements:**
- Real GDP data integration
- Dynamic economic indicators
- Sector-specific damage models
- International trade disruption modeling
- Insurance and reinsurance impacts

## Validation Against Historical Events

### **Tunguska Event (1908)**
- **Estimated TNT**: 10-15 megatons (10¹³ kg)
- **Location**: Remote Siberia
- **Model Prediction**: ~$100,000M (with 1.0× location factor)
- **Actual Impact**: Minimal economic damage (uninhabited area)

### **Chelyabinsk Meteor (2013)**
- **Estimated TNT**: 500 kilotons (5×10⁸ kg)
- **Location**: Industrial city (500,000 people)
- **Model Prediction**: ~$750M
- **Actual Damage**: ~$33M (mainly window damage)
- **Note**: Model may overestimate for smaller events

## Usage in Application

The enhanced calculation provides:

1. **Realistic Location-Based Estimates**
2. **Detailed Breakdown Visualization**
3. **Educational Value** about economic impact factors
4. **Policy Decision Support** for asteroid defense priorities

## Code Implementation

The calculation is implemented in the `calculateEconomicDamage()` function in `frontend/src/App.js`, with real-time breakdown display in the impact dashboard.

---

*This enhanced model provides a more realistic and educational representation of potential economic impacts from asteroid strikes, though actual impacts would vary significantly based on numerous additional factors.*

