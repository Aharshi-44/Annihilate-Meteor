/**
 * GeoDB API Integration Test Suite
 * Demonstrates usage of the GeoDB Cities API integration
 */

import { get_city_data, get_multiple_cities_data, getEnhancedPopulationData, GeoDBExamples } from './geoDBAPI';

/**
 * Test the basic city data retrieval
 */
export async function testBasicCityData() {
  console.log('🧪 Testing Basic City Data Retrieval...');
  
  try {
    // Test 1: Tokyo
    console.log('\n📍 Testing Tokyo...');
    const tokyo = await get_city_data("Tokyo");
    console.log('Tokyo Result:', tokyo);
    
    // Test 2: New York
    console.log('\n📍 Testing New York...');
    const newYork = await get_city_data("New York");
    console.log('New York Result:', newYork);
    
    // Test 3: London
    console.log('\n📍 Testing London...');
    const london = await get_city_data("London");
    console.log('London Result:', london);
    
    // Test 4: Delhi
    console.log('\n📍 Testing Delhi...');
    const delhi = await get_city_data("Delhi");
    console.log('Delhi Result:', delhi);
    
    // Test 5: São Paulo
    console.log('\n📍 Testing São Paulo...');
    const saoPaulo = await get_city_data("São Paulo");
    console.log('São Paulo Result:', saoPaulo);
    
    return {
      tokyo,
      newYork,
      london,
      delhi,
      saoPaulo
    };
    
  } catch (error) {
    console.error('❌ Basic city data test failed:', error);
    throw error;
  }
}

/**
 * Test multiple cities retrieval
 */
export async function testMultipleCities() {
  console.log('\n🧪 Testing Multiple Cities Retrieval...');
  
  try {
    const cities = await get_multiple_cities_data([
      "Tokyo",
      "New York", 
      "London",
      "Paris",
      "Berlin",
      "Moscow",
      "Beijing",
      "Mumbai",
      "Sydney",
      "Los Angeles"
    ]);
    
    console.log('Multiple Cities Results:', cities);
    
    // Analyze results
    const successful = cities.filter(city => !city.error);
    const failed = cities.filter(city => city.error);
    
    console.log(`✅ Successfully retrieved: ${successful.length} cities`);
    console.log(`❌ Failed to retrieve: ${failed.length} cities`);
    
    if (failed.length > 0) {
      console.log('Failed cities:', failed.map(c => c.city));
    }
    
    return cities;
    
  } catch (error) {
    console.error('❌ Multiple cities test failed:', error);
    throw error;
  }
}

/**
 * Test enhanced population data for specific coordinates
 */
export async function testEnhancedPopulationData() {
  console.log('\n🧪 Testing Enhanced Population Data...');
  
  const testLocations = [
    { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
    { name: "New York", lat: 40.7128, lng: -74.0060 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
    { name: "Behala, West Bengal", lat: 22.5089, lng: 88.3244 },
    { name: "Random Ocean Location", lat: 0, lng: 0 }
  ];
  
  const results = [];
  
  for (const location of testLocations) {
    try {
      console.log(`\n📍 Testing ${location.name}...`);
      const data = await getEnhancedPopulationData(location.lat, location.lng, location.name);
      console.log(`${location.name} Result:`, data);
      results.push({ location, data });
    } catch (error) {
      console.error(`❌ Failed to get data for ${location.name}:`, error);
      results.push({ location, data: null, error: error.message });
    }
  }
  
  return results;
}

/**
 * Compare GeoDB API results with hardcoded data
 */
export async function compareWithHardcodedData() {
  console.log('\n🧪 Comparing GeoDB API with Hardcoded Data...');
  
  const hardcodedCities = [
    { name: "New York", lat: 40.7128, lng: -74.0060, pop: 8400000 },
    { name: "London", lat: 51.5074, lng: -0.1278, pop: 9000000 },
    { name: "Tokyo", lat: 35.6762, lng: 139.6503, pop: 14000000 },
    { name: "Delhi", lat: 28.6139, lng: 77.2090, pop: 32000000 },
    { name: "São Paulo", lat: -23.5505, lng: -46.6333, pop: 12300000 }
  ];
  
  const comparison = [];
  
  for (const hardcoded of hardcodedCities) {
    try {
      const geoDBData = await get_city_data(hardcoded.name);
      
      const comparisonItem = {
        city: hardcoded.name,
        hardcoded: {
          latitude: hardcoded.lat,
          longitude: hardcoded.lng,
          population: hardcoded.pop
        },
        geoDB: {
          latitude: geoDBData.latitude,
          longitude: geoDBData.longitude,
          population: geoDBData.population,
          country: geoDBData.country
        },
        differences: {
          latDiff: Math.abs(hardcoded.lat - geoDBData.latitude),
          lngDiff: Math.abs(hardcoded.lng - geoDBData.longitude),
          popDiff: Math.abs(hardcoded.pop - geoDBData.population),
          popRatio: geoDBData.population / hardcoded.pop
        }
      };
      
      comparison.push(comparisonItem);
      console.log(`\n📊 ${hardcoded.name} Comparison:`, comparisonItem);
      
    } catch (error) {
      console.error(`❌ Failed to compare ${hardcoded.name}:`, error);
      comparison.push({
        city: hardcoded.name,
        error: error.message
      });
    }
  }
  
  return comparison;
}

/**
 * Test error handling
 */
export async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  
  const errorTestCases = [
    { input: "", description: "Empty string" },
    { input: null, description: "Null input" },
    { input: undefined, description: "Undefined input" },
    { input: 123, description: "Number input" },
    { input: "NonExistentCity12345", description: "Non-existent city" },
    { input: "X", description: "Single character" }
  ];
  
  const results = [];
  
  for (const testCase of errorTestCases) {
    try {
      console.log(`\n🔍 Testing: ${testCase.description} ("${testCase.input}")`);
      const result = await get_city_data(testCase.input);
      console.log(`Unexpected success:`, result);
      results.push({ testCase, result, error: null });
    } catch (error) {
      console.log(`✅ Expected error: ${error.message}`);
      results.push({ testCase, result: null, error: error.message });
    }
  }
  
  return results;
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting GeoDB API Integration Tests...\n');
  
  const testResults = {
    startTime: new Date(),
    tests: {}
  };
  
  try {
    // Test 1: Basic city data
    testResults.tests.basicCityData = await testBasicCityData();
    
    // Test 2: Multiple cities
    testResults.tests.multipleCities = await testMultipleCities();
    
    // Test 3: Enhanced population data
    testResults.tests.enhancedPopulationData = await testEnhancedPopulationData();
    
    // Test 4: Comparison with hardcoded data
    testResults.tests.comparison = await compareWithHardcodedData();
    
    // Test 5: Error handling
    testResults.tests.errorHandling = await testErrorHandling();
    
    testResults.endTime = new Date();
    testResults.duration = testResults.endTime - testResults.startTime;
    
    console.log('\n🎉 All tests completed!');
    console.log(`⏱️ Total duration: ${testResults.duration}ms`);
    
    return testResults;
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    testResults.error = error.message;
    testResults.endTime = new Date();
    testResults.duration = testResults.endTime - testResults.startTime;
    return testResults;
  }
}

/**
 * Quick test for specific city (as requested in requirements)
 */
export async function quickTest() {
  console.log('🧪 Quick Test - Tokyo Example...');
  
  try {
    const city = await get_city_data("Tokyo");
    console.log('Tokyo Result:', city);
    
    // Expected output format check
    const hasRequiredFields = city.city && city.country && city.latitude && city.longitude && city.population;
    console.log('✅ Has required fields:', hasRequiredFields);
    
    if (hasRequiredFields) {
      console.log('✅ Expected output format:');
      console.log('{');
      console.log(`  city: "${city.city}",`);
      console.log(`  country: "${city.country}",`);
      console.log(`  latitude: ${city.latitude},`);
      console.log(`  longitude: ${city.longitude},`);
      console.log(`  population: ${city.population}`);
      console.log('}');
    }
    
    return city;
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    throw error;
  }
}

// Export test functions for individual use
export {
  testBasicCityData,
  testMultipleCities,
  testEnhancedPopulationData,
  compareWithHardcodedData,
  testErrorHandling,
  quickTest
};

export default {
  runAllTests,
  quickTest,
  testBasicCityData,
  testMultipleCities,
  testEnhancedPopulationData,
  compareWithHardcodedData,
  testErrorHandling
};

