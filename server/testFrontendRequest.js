const axios = require('axios');

const API_URL = 'http://localhost:4001';

async function testFrontendRequest() {
  try {
    console.log('🧪 Testing Frontend-like Request...\n');

    // Test exactly what the frontend is sending
    console.log('1. Testing complaint creation with minimal data:');
    
    try {
      const response = await axios.post(`${API_URL}/api/complaints`, 
        { query: 'Test complaint' },
        { 
          headers: { 
            'Content-Type': 'application/json',
            // No Authorization header - this should trigger our debug logs
          }
        }
      );
      console.log('   ✅ Success:', response.data);
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.response?.data?.error}`);
      console.log('   Response data:', error.response?.data);
    }

    // Test 2: Check if the endpoint exists
    console.log('\n2. Testing if endpoint exists (OPTIONS request):');
    try {
      const response = await axios.options(`${API_URL}/api/complaints`);
      console.log('   ✅ Endpoint exists');
    } catch (error) {
      console.log('   ❌ Endpoint issue:', error.response?.status);
    }

    // Test 3: Check server logs
    console.log('\n3. Check server console for debug logs starting with:');
    console.log('   "=== COMPLAINT CREATION DEBUG ==="');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendRequest();
