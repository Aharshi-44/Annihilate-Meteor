/**
 * GeoDB Cities API Integration
 * Provides real-time city data for population calculations in asteroid impact simulation
 */

const GEO_DB_CONFIG = {
  baseURL: 'https://geodb-cities.p.rapidapi.com',
  apiKey: '768af60a2emshee926546ecd5e82p13881bjsn272518c34a58',
  host: 'geodb-cities.p.rapidapi.com'
};

/**
 * Search for a city using GeoDB Cities API
 * @param {string} cityName - Name of the city to search for
 * @returns {Promise<Object>} City data object with population, coordinates, etc.
 */
export async function get_city_data(cityName) {
  if (!cityName || typeof cityName !== 'string') {
    throw new Error('City name must be a non-empty string');
  }

  try {
    // First, search for cities with the given name
    const searchResponse = await fetch(
      `${GEO_DB_CONFIG.baseURL}/v1/geo/cities?namePrefix=${encodeURIComponent(cityName)}&limit=10`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': GEO_DB_CONFIG.apiKey,
          'X-RapidAPI-Host': GEO_DB_CONFIG.host,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`API request failed: ${searchResponse.status} ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      throw new Error(`No cities found matching "${cityName}"`);
    }

    // Filter cities that match the name exactly (case-insensitive)
    const exactMatches = searchData.data.filter(city => 
      city.name.toLowerCase() === cityName.toLowerCase()
    );

    let cities = exactMatches.length > 0 ? exactMatches : searchData.data;

    // Get detailed population data for each city
    const citiesWithPopulation = await Promise.all(
      cities.map(async (city) => {
        try {
          // Get city details including population
          const detailsResponse = await fetch(
            `${GEO_DB_CONFIG.baseURL}/v1/geo/cities/${city.id}`,
            {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': GEO_DB_CONFIG.apiKey,
                'X-RapidAPI-Host': GEO_DB_CONFIG.host,
                'Content-Type': 'application/json'
              }
            }
          );

          if (detailsResponse.ok) {
            const details = await detailsResponse.json();
            return {
              ...city,
              population: details.data?.population || 0
            };
          }
          
          return {
            ...city,
            population: 0
          };
        } catch (error) {
          console.warn(`Failed to get population for ${city.name}:`, error);
          return {
            ...city,
            population: 0
          };
        }
      })
    );

    // Sort by population (largest first) and return the best match
    citiesWithPopulation.sort((a, b) => (b.population || 0) - (a.population || 0));
    const bestMatch = citiesWithPopulation[0];

    // Get country name
    let countryName = 'Unknown';
    if (bestMatch.countryCode) {
      try {
        const countryResponse = await fetch(
          `${GEO_DB_CONFIG.baseURL}/v1/geo/countries/${bestMatch.countryCode}`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': GEO_DB_CONFIG.apiKey,
              'X-RapidAPI-Host': GEO_DB_CONFIG.host,
              'Content-Type': 'application/json'
            }
          }
        );

        if (countryResponse.ok) {
          const countryData = await countryResponse.json();
          countryName = countryData.data?.name || bestMatch.countryCode;
        }
      } catch (error) {
        console.warn(`Failed to get country name for ${bestMatch.name}:`, error);
        countryName = bestMatch.countryCode || 'Unknown';
      }
    }

    return {
      city: bestMatch.name,
      country: countryName,
      latitude: bestMatch.latitude,
      longitude: bestMatch.longitude,
      population: bestMatch.population || 0,
      countryCode: bestMatch.countryCode,
      region: bestMatch.region,
      wikiDataId: bestMatch.wikiDataId
    };

  } catch (error) {
    console.error(`Error fetching city data for "${cityName}":`, error);
    throw new Error(`Failed to fetch city data: ${error.message}`);
  }
}

/**
 * Get multiple cities data in batch
 * @param {string[]} cityNames - Array of city names to search for
 * @returns {Promise<Object[]>} Array of city data objects
 */
export async function get_multiple_cities_data(cityNames) {
  if (!Array.isArray(cityNames)) {
    throw new Error('cityNames must be an array');
  }

  const results = await Promise.allSettled(
    cityNames.map(cityName => get_city_data(cityName))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to fetch data for city "${cityNames[index]}":`, result.reason);
      return {
        city: cityNames[index],
        country: 'Unknown',
        latitude: 0,
        longitude: 0,
        population: 0,
        error: result.reason.message
      };
    }
  });
}

/**
 * Search for cities by country
 * @param {string} countryName - Name of the country
 * @param {number} limit - Maximum number of cities to return (default: 10)
 * @returns {Promise<Object[]>} Array of city data objects
 */
export async function get_cities_by_country(countryName, limit = 10) {
  try {
    const response = await fetch(
      `${GEO_DB_CONFIG.baseURL}/v1/geo/cities?countryIds=${encodeURIComponent(countryName)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': GEO_DB_CONFIG.apiKey,
          'X-RapidAPI-Host': GEO_DB_CONFIG.host,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error(`No cities found in country "${countryName}"`);
    }

    return data.data.map(city => ({
      city: city.name,
      country: countryName,
      latitude: city.latitude,
      longitude: city.longitude,
      population: 0, // Would need individual API calls for population
      countryCode: city.countryCode,
      region: city.region
    }));

  } catch (error) {
    console.error(`Error fetching cities for country "${countryName}":`, error);
    throw new Error(`Failed to fetch cities: ${error.message}`);
  }
}

/**
 * Enhanced population data function that uses GeoDB API as fallback
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} cityName - Optional city name for more accurate results
 * @returns {Promise<Object>} Population data object
 */
export async function getEnhancedPopulationData(lat, lng, cityName = null) {
  try {
    // If city name is provided, try to get exact city data
    if (cityName) {
      const cityData = await get_city_data(cityName);
      return {
        population: cityData.population,
        density: cityData.population > 0 ? Math.floor(cityData.population / 1000) : 0,
        city: cityData.city,
        country: cityData.country,
        source: 'geodb_api'
      };
    }

    // Fallback to coordinate-based search (nearby cities)
    // GeoDB nearby endpoint: /v1/geo/locations/{lat}{+/-}{lng}/nearbyCities
    const latStr = Number(lat).toFixed(4);
    const lngNum = Number(lng);
    const lngStr = `${lngNum >= 0 ? '+' : ''}${lngNum.toFixed(4)}`;
    const nearbyUrl = `${GEO_DB_CONFIG.baseURL}/v1/geo/locations/${latStr}${lngStr}/nearbyCities?radius=50&limit=5&distanceUnit=KM`;
    const response = await fetch(
      nearbyUrl,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': GEO_DB_CONFIG.apiKey,
          'X-RapidAPI-Host': GEO_DB_CONFIG.host,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Get the closest city
        const closestCity = data.data[0];
        const cityData = await get_city_data(closestCity.name);
        
        return {
          population: cityData.population,
          density: cityData.population > 0 ? Math.floor(cityData.population / 1000) : 0,
          city: cityData.city,
          country: cityData.country,
          source: 'geodb_api'
        };
      }
    }

    // If API fails, fall back to the original hardcoded method
    console.warn('GeoDB API failed, falling back to hardcoded data');
    return getFallbackPopulationData(lat, lng);

  } catch (error) {
    console.error('Error in enhanced population data:', error);
    return getFallbackPopulationData(lat, lng);
  }
}

/**
 * Fallback population data using the original hardcoded method
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Population data object
 */
function getFallbackPopulationData(lat, lng) {
  // Original hardcoded cities data
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
    density: Math.floor(estimatedPopulation / 1000),
    city: 'Unknown',
    country: 'Unknown',
    source: 'fallback_hardcoded'
  };
}

// Example usage and testing functions
export const GeoDBExamples = {
  /**
   * Example: Get Tokyo data
   */
  async tokyoExample() {
    try {
      const city = await get_city_data("Tokyo");
      console.log('Tokyo Data:', city);
      return city;
    } catch (error) {
      console.error('Tokyo example failed:', error);
    }
  },

  /**
   * Example: Get multiple cities
   */
  async multipleCitiesExample() {
    try {
      const cities = await get_multiple_cities_data(["New York", "London", "Paris", "Berlin"]);
      console.log('Multiple Cities Data:', cities);
      return cities;
    } catch (error) {
      console.error('Multiple cities example failed:', error);
    }
  },

  /**
   * Example: Enhanced population data
   */
  async enhancedPopulationExample() {
    try {
      // Example for Tokyo coordinates
      const data = await getEnhancedPopulationData(35.6762, 139.6503, "Tokyo");
      console.log('Enhanced Population Data:', data);
      return data;
    } catch (error) {
      console.error('Enhanced population example failed:', error);
    }
  }
};

export default {
  get_city_data,
  get_multiple_cities_data,
  get_cities_by_country,
  getEnhancedPopulationData,
  GeoDBExamples
};

