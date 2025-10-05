import requests
import sys
import json
from datetime import datetime

class AsteroidDefenseAPITester:
    def __init__(self, base_url="https://space-defender-16.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.impact_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout (30s)")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_neo_current_data(self):
        """Test fetching current NEO data from NASA"""
        success, response = self.run_test("Current NEO Data", "GET", "neo/current", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} NEO objects")
            if len(response) > 0:
                neo = response[0]
                required_fields = ['id', 'name', 'diameter_min', 'diameter_max', 'velocity']
                for field in required_fields:
                    if field not in neo:
                        print(f"   ⚠️  Missing field: {field}")
                        return False
                print(f"   Sample NEO: {neo['name']} - {neo['diameter_min']:.1f}m diameter")
        return success

    def test_impact_calculation(self):
        """Test impact scenario calculation"""
        test_params = {
            "diameter": 100,
            "velocity": 20000,
            "density": 3000,
            "angle": 45,
            "latitude": 40.7128,
            "longitude": -74.0060
        }
        
        success, response = self.run_test(
            "Impact Calculation", 
            "POST", 
            "impact/calculate", 
            200, 
            data=test_params
        )
        
        if success and isinstance(response, dict):
            # Store impact ID for mitigation tests
            self.impact_id = response.get('id')
            
            # Verify required fields
            required_fields = [
                'kinetic_energy', 'tnt_equivalent', 'crater_diameter', 
                'crater_depth', 'seismic_magnitude', 'tsunami_risk', 
                'environmental_effects'
            ]
            
            for field in required_fields:
                if field not in response:
                    print(f"   ⚠️  Missing field: {field}")
                    return False
            
            print(f"   Impact ID: {self.impact_id}")
            print(f"   Kinetic Energy: {response['kinetic_energy']:.2e} J")
            print(f"   Crater Diameter: {response['crater_diameter']:.1f} m")
            print(f"   Seismic Magnitude: {response['seismic_magnitude']:.1f}")
            print(f"   Tsunami Risk: {response['tsunami_risk']}")
            
        return success

    def test_mitigation_strategies(self):
        """Test mitigation strategies calculation"""
        test_params = {
            "diameter": 100,
            "velocity": 20000,
            "density": 3000,
            "angle": 45,
            "latitude": 40.7128,
            "longitude": -74.0060
        }
        
        success, response = self.run_test(
            "Mitigation Strategies", 
            "POST", 
            "mitigation/strategies", 
            200, 
            data=test_params,
            params={"lead_time": 10.0}
        )
        
        if success and isinstance(response, dict):
            strategies = response.get('strategies', {})
            print(f"   Available strategies: {list(strategies.keys())}")
            
            for strategy_name, strategy in strategies.items():
                required_fields = [
                    'strategy_type', 'lead_time', 'success_probability', 
                    'velocity_change', 'cost_estimate', 'description'
                ]
                for field in required_fields:
                    if field not in strategy:
                        print(f"   ⚠️  Missing field in {strategy_name}: {field}")
                        return False
                        
                print(f"   {strategy_name}: {strategy['success_probability']*100:.0f}% success, ${strategy['cost_estimate']}M")
        
        return success

    def test_mitigation_simulation(self):
        """Test mitigation strategy simulation"""
        if not self.impact_id:
            print("   ⚠️  No impact ID available, skipping mitigation simulation")
            return False
            
        success, response = self.run_test(
            "Mitigation Simulation", 
            "POST", 
            "mitigation/simulate", 
            200,
            params={
                "impact_id": self.impact_id,
                "strategy_type": "kinetic_impactor"
            }
        )
        
        if success and isinstance(response, dict):
            required_fields = [
                'deflection_distance', 'new_trajectory', 'risk_reduction'
            ]
            
            for field in required_fields:
                if field not in response:
                    print(f"   ⚠️  Missing field: {field}")
                    return False
            
            print(f"   Deflection Distance: {response['deflection_distance']:.1f} km")
            print(f"   Risk Reduction: {response['risk_reduction']:.1f}%")
            
        return success

    def test_geology_data(self):
        """Test geology data endpoint"""
        success, response = self.run_test(
            "Geology Data", 
            "GET", 
            "geology/data", 
            200,
            params={"latitude": 40.7128, "longitude": -74.0060}
        )
        
        if success and isinstance(response, dict):
            required_fields = [
                'location', 'elevation', 'population_density', 
                'coastal_proximity', 'seismic_activity', 'geological_stability'
            ]
            
            for field in required_fields:
                if field not in response:
                    print(f"   ⚠️  Missing field: {field}")
                    return False
            
            print(f"   Elevation: {response['elevation']:.1f} m")
            print(f"   Population Density: {response['population_density']:.1f}")
            print(f"   Geological Stability: {response['geological_stability']}")
            
        return success

    def test_scenario_history(self):
        """Test scenario history endpoint"""
        return self.run_test("Scenario History", "GET", "scenarios/history", 200)

def main():
    print("🚀 Starting Asteroid Defense API Testing...")
    print("=" * 60)
    
    tester = AsteroidDefenseAPITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_root_endpoint),
        ("NEO Current Data", tester.test_neo_current_data),
        ("Impact Calculation", tester.test_impact_calculation),
        ("Mitigation Strategies", tester.test_mitigation_strategies),
        ("Mitigation Simulation", tester.test_mitigation_simulation),
        ("Geology Data", tester.test_geology_data),
        ("Scenario History", tester.test_scenario_history),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())