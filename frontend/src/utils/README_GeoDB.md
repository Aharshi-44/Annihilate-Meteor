# 🌍 GeoDB Cities API Integration

This module provides integration with the GeoDB Cities API to fetch real-time city data for the ANNIHILATE-METEOR asteroid impact simulation project.

## 🚀 Quick Start

### Basic Usage

```javascript
import { get_city_data } from './utils/geoDBAPI';

// Get city data
const city = await get_city_data("Tokyo");
console.log(city);
// Expected output:
// {
//   city: "Tokyo",
//   country: "Japan",
//   latitude: 35.6895,
//   longitude: 139.6917,
//   population: 37977000
// }
```

### Multiple Cities

```javascript
import { get_multiple_cities_data } from './utils/geoDBAPI';

const cities = await get_multiple_cities_data(["Tokyo", "New York", "London"]);
console.log(cities);
```

### Enhanced Population Data

```javascript
import { getEnhancedPopulationData } from './utils/geoDBAPI';

const data = await getEnhancedPopulationData(35.6762, 139.6503, "Tokyo");
console.log(data);
```

## 📋 API Reference

### `get_city_data(cityName: string)`

Searches for a city and returns detailed information.

**Parameters:**
- `cityName` (string): Name of the city to search for

**Returns:**
- `Promise<Object>`: City data object

**Example:**
```javascript
const tokyo = await get_city_data("Tokyo");
```

**Response Format:**
```javascript
{
  city: "Tokyo",
  country: "Japan",
  latitude: 35.6895,
  longitude: 139.6917,
  population: 37977000,
  countryCode: "JP",
  region: "Tokyo",
  wikiDataId: "Q1490"
}
```

### `get_multiple_cities_data(cityNames: string[])`

Retrieves data for multiple cities in batch.

**Parameters:**
- `cityNames` (string[]): Array of city names

**Returns:**
- `Promise<Object[]>`: Array of city data objects

**Example:**
```javascript
const cities = await get_multiple_cities_data(["Tokyo", "New York", "London"]);
```

### `getEnhancedPopulationData(lat: number, lng: number, cityName?: string)`

Gets population data for coordinates with optional city name for accuracy.

**Parameters:**
- `lat` (number): Latitude
- `lng` (number): Longitude
- `cityName` (string, optional): City name for more accurate results

**Returns:**
- `Promise<Object>`: Population data object

**Example:**
```javascript
const data = await getEnhancedPopulationData(35.6762, 139.6503, "Tokyo");
```

**Response Format:**
```javascript
{
  population: 37977000,
  density: 37977,
  city: "Tokyo",
  country: "Japan",
  source: "geodb_api"
}
```

### `get_cities_by_country(countryName: string, limit?: number)`

Gets cities by country name.

**Parameters:**
- `countryName` (string): Name of the country
- `limit` (number, optional): Maximum number of cities (default: 10)

**Returns:**
- `Promise<Object[]>`: Array of city data objects

## 🔧 Configuration

The API configuration is stored in `geoDBAPI.js`:

```javascript
const GEO_DB_CONFIG = {
  baseURL: 'https://geodb-cities.p.rapidapi.com',
  apiKey: '768af60a2emshee926546ecd5e82p13881bjsn272518c34a58',
  host: 'geodb-cities.p.rapidapi.com'
};
```

## 🛡️ Error Handling

All functions include comprehensive error handling:

1. **Input Validation**: Checks for valid input parameters
2. **API Error Handling**: Handles HTTP errors and network issues
3. **Fallback Mechanism**: Falls back to hardcoded data if API fails
4. **Graceful Degradation**: Returns partial data when possible

### Error Response Format

```javascript
{
  city: "RequestedCity",
  country: "Unknown",
  latitude: 0,
  longitude: 0,
  population: 0,
  error: "Error message describing what went wrong"
}
```

## 🔄 Integration with Existing Project

### Updated Population Calculation

The existing `getPopulationData` function has been enhanced to use GeoDB API:

```javascript
// Old synchronous version
const popData = getPopulationData(lat, lng);

// New async version with GeoDB API
const popData = await getPopulationData(lat, lng, cityName);
```

### Updated Impact Metrics

The `calculateImpactMetrics` function now supports GeoDB data:

```javascript
// Old version
const metrics = calculateImpactMetrics(impactResults, selectedPosition);

// New async version
const metrics = await calculateImpactMetrics(impactResults, selectedPosition, cityName);
```

## 📊 Data Sources

### Primary Source: GeoDB Cities API
- **Real-time data**: Up-to-date city information
- **Comprehensive coverage**: Global city database
- **Accurate coordinates**: Precise latitude/longitude
- **Population data**: Current population estimates

### Fallback Source: Hardcoded Data
- **Reliability**: Always available
- **Performance**: No network requests
- **Limited scope**: 5 major cities only

## 🧪 Testing

### Run Tests

```javascript
import { runAllTests, quickTest } from './utils/geoDBTest';

// Quick test
await quickTest();

// Full test suite
const results = await runAllTests();
```

### Test Coverage

- ✅ Basic city data retrieval
- ✅ Multiple cities batch processing
- ✅ Enhanced population data
- ✅ Error handling
- ✅ Fallback mechanisms
- ✅ Data accuracy comparison

## 📈 Performance Considerations

### Caching
- API responses are not cached by default
- Consider implementing caching for frequently accessed cities
- Fallback data is always available for performance

### Rate Limiting
- GeoDB API has rate limits
- Implement request throttling if needed
- Use batch requests for multiple cities

### Network Optimization
- Uses modern fetch API
- Includes timeout handling
- Graceful degradation on network failures

## 🔍 Debugging

### Enable Debug Logging

```javascript
// Check console for detailed logs
console.log('GeoDB API Debug Mode Enabled');
```

### Common Issues

1. **API Key Issues**: Verify API key is correct
2. **Network Errors**: Check internet connection
3. **City Not Found**: Try alternative city names
4. **Rate Limiting**: Implement request delays

## 📚 Examples

See `frontend/src/examples/geoDBUsageExample.js` for comprehensive usage examples:

- Basic city data retrieval
- Multiple cities processing
- Impact simulation integration
- Error handling demonstration
- Real-world usage scenarios

## 🚀 Future Enhancements

### Planned Features
- [ ] Response caching
- [ ] Request batching optimization
- [ ] More detailed error messages
- [ ] Population density calculations
- [ ] Historical population data
- [ ] City boundary data

### Integration Opportunities
- [ ] Real-time population updates
- [ ] Economic data integration
- [ ] Climate data correlation
- [ ] Infrastructure mapping

## 📞 Support

For issues or questions:
1. Check the error logs in browser console
2. Verify API key and network connection
3. Test with the provided examples
4. Check GeoDB API documentation

## 🔗 Related Files

- `frontend/src/utils/geoDBAPI.js` - Main API integration
- `frontend/src/utils/geoDBTest.js` - Test suite
- `frontend/src/examples/geoDBUsageExample.js` - Usage examples
- `frontend/src/App.js` - Integration with main application

---

**🛡️ Protecting Earth with Real-Time Data** 🛡️

