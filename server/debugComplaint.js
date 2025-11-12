const axios = require('axios');

const API_URL = 'http://localhost:4001';

async function debugComplaintAPI() {
  try {
    console.log('🔍 Debugging Complaint API...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server health:');
    try {
      const healthResponse = await axios.get(`${API_URL}/api/health`);
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
      return;
    }

    // Test 2: Try to access complaints without auth (should get 401)
    console.log('\n2. Testing complaints endpoint without auth:');
    try {
      const response = await axios.get(`${API_URL}/api/complaints`);
      console.log('❌ Unexpected success:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returns 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Try to create complaint without auth (should get 401)
    console.log('\n3. Testing complaint creation without auth:');
    try {
      const response = await axios.post(`${API_URL}/api/complaints`, {
        query: 'Test complaint'
      });
      console.log('❌ Unexpected success:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returns 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n📝 Next steps:');
    console.log('1. Make sure you are logged in on the client');
    console.log('2. Check browser network tab for the actual request being made');
    console.log('3. Verify the Authorization header is being sent');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugComplaintAPI();
