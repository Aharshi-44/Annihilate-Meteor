/**
 * GeoDB API Usage Examples
 * Demonstrates how to use the GeoDB Cities API integration in your asteroid simulation project
 */

import { get_city_data, get_multiple_cities_data, getEnhancedPopulationData } from '../utils/geoDBAPI';

/**
 * Example 1: Basic city data retrieval (as requested)
 */
export async function example1_BasicCityData() {
  console.log('📍 Example 1: Basic City Data Retrieval');
  
  try {
    const city = await get_city_data("Tokyo");
    console.log('Tokyo Data:', city);
    
    // Expected output:
    // {
    //   city: "Tokyo",
    //   country: "Japan", 
    //   latitude: 35.6895,
    //   longitude: 139.6917,
    //   population: 37977000
    // }
    
    return city;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Example 2: Multiple cities for comparison
 */
export async function example2_MultipleCities() {
  console.log('📍 Example 2: Multiple Cities Data');
  
  try {
    const cities = await get_multiple_cities_data([
      "Tokyo",
      "New York", 
      "London",
      "Delhi",
      "São Paulo"
    ]);
    
    console.log('Multiple Cities Data:', cities);
    
    // Display results in a table format
    console.table(cities.map(city => ({
      City: city.city,
      Country: city.country,
      Population: city.population?.toLocaleString() || 'N/A',
      Latitude: city.latitude,
      Longitude: city.longitude
    })));
    
    return cities;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Example 3: Enhanced population data for impact simulation
 */
export async function example3_ImpactSimulation() {
  console.log('📍 Example 3: Impact Simulation with GeoDB Data');
  
  // Simulate impact near Tokyo
  const impactLocation = {
    latitude: 35.6762,
    longitude: 139.6503,
    cityName: "Tokyo"
  };
  
  try {
    const populationData = await getEnhancedPopulationData(
      impactLocation.latitude,
      impactLocation.longitude,
      impactLocation.cityName
    );
    
    console.log('Impact Location Population Data:', populationData);
    
    // Simulate impact calculations
    const impactEnergy = 1e15; // 1 petajoule
    const craterRadius = Math.pow(impactEnergy / 1e15, 0.25) * 0.5; // km
    const affectedArea = Math.PI * Math.pow(craterRadius * 10, 2); // km²
    
    const impactAssessment = {
      location: {
        city: populationData.city,
        country: populationData.country,
        coordinates: [impactLocation.latitude, impactLocation.longitude]
      },
      population: {
        total: populationData.population,
        density: populationData.density,
        source: populationData.source
      },
      impact: {
        energy: impactEnergy,
        craterRadius: craterRadius,
        affectedArea: affectedArea,
        estimatedCasualties: Math.floor(affectedArea * populationData.density * 0.7)
      }
    };
    
    console.log('Impact Assessment:', impactAssessment);
    return impactAssessment;
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Example 4: Integration with existing asteroid simulation
 */
export async function example4_IntegrationWithSimulation() {
  console.log('📍 Example 4: Integration with Asteroid Simulation');
  
  // This shows how to integrate with your existing calculateImpactMetrics function
  const mockImpactResults = {
    crater_diameter: 2000, // meters
    kinetic_energy: 1e15, // joules
    tnt_equivalent: 239000, // tons
    environmental_effects: {
      dust_injection: 15
    }
  };
  
  const selectedPosition = {
    latitude: 22.5089, // Behala, West Bengal
    longitude: 88.3244
  };
  
  try {
    // Get population data using GeoDB API
    const populationData = await getEnhancedPopulationData(
      selectedPosition.latitude,
      selectedPosition.longitude,
      "Kolkata" // Try to get Kolkata data since Behala is near Kolkata
    );
    
    console.log('Population Data for Impact Location:', populationData);
    
    // Calculate impact metrics (this would use your existing function)
    const craterRadiusKm = mockImpactResults.crater_diameter / 2000;
    const affectedArea = Math.PI * Math.pow(craterRadiusKm * 10, 2);
    
    const impactMetrics = {
      location: {
        city: populationData.city,
        country: populationData.country,
        coordinates: [selectedPosition.latitude, selectedPosition.longitude]
      },
      population: {
        total: populationData.population,
        density: populationData.density,
        source: populationData.source
      },
      impact: {
        craterRadius: craterRadiusKm,
        affectedArea: affectedArea,
        populationAffected: Math.min(populationData.population, Math.floor(affectedArea * populationData.density)),
        casualties: Math.floor(Math.min(populationData.population, affectedArea * populationData.density) * 0.7)
      }
    };
    
    console.log('Impact Metrics:', impactMetrics);
    return impactMetrics;
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Example 5: Error handling and fallback
 */
export async function example5_ErrorHandling() {
  console.log('📍 Example 5: Error Handling and Fallback');
  
  const testCases = [
    { name: "Valid City", input: "Tokyo" },
    { name: "Invalid City", input: "NonExistentCity123" },
    { name: "Empty String", input: "" },
    { name: "Null Input", input: null }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: ${testCase.name} ("${testCase.input}")`);
      const result = await get_city_data(testCase.input);
      console.log('✅ Success:', result);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running GeoDB API Usage Examples...\n');
  
  try {
    await example1_BasicCityData();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example2_MultipleCities();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example3_ImpactSimulation();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example4_IntegrationWithSimulation();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example5_ErrorHandling();
    
    console.log('\n🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('💥 Examples failed:', error);
    throw error;
  }
}

// Export individual examples
export {
  example1_BasicCityData,
  example2_MultipleCities,
  example3_ImpactSimulation,
  example4_IntegrationWithSimulation,
  example5_ErrorHandling
};

export default {
  runAllExamples,
  example1_BasicCityData,
  example2_MultipleCities,
  example3_ImpactSimulation,
  example4_IntegrationWithSimulation,
  example5_ErrorHandling
};

