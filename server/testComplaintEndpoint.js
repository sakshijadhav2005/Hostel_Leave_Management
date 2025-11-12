const axios = require('axios');

const API_URL = 'http://localhost:4001';

async function testComplaintEndpoint() {
  try {
    console.log('🧪 Testing Complaint Endpoint with Different Scenarios...\n');

    // Test 1: Try to create complaint without auth (should get 401)
    console.log('1. Testing without authentication:');
    try {
      await axios.post(`${API_URL}/api/complaints`, { query: 'Test complaint' });
    } catch (error) {
      console.log(`   Status: ${error.response?.status} - ${error.response?.data?.error || error.response?.data?.message}`);
    }

    // Test 2: Try with a fake token (should get 401)
    console.log('\n2. Testing with invalid token:');
    try {
      await axios.post(`${API_URL}/api/complaints`, 
        { query: 'Test complaint' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    } catch (error) {
      console.log(`   Status: ${error.response?.status} - ${error.response?.data?.error || error.response?.data?.message}`);
    }

    // Test 3: Try to login first and then create complaint
    console.log('\n3. Testing with actual login:');
    try {
      // Login with a student account
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'jadhavsakshi389@gmail.com',
        password: 'password123' // You might need to adjust this password
      });
      
      const token = loginResponse.data.token;
      console.log('   ✅ Login successful');
      console.log('   User role:', loginResponse.data.user?.role);

      // Now try to create complaint
      const complaintResponse = await axios.post(`${API_URL}/api/complaints`, 
        { query: 'Test complaint from authenticated user' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('   ✅ Complaint created successfully:', complaintResponse.data.message);
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ❌ 400 Bad Request:', error.response?.data?.message);
        console.log('   Details:', error.response?.data);
      } else if (error.response?.status === 403) {
        console.log('   ❌ 403 Forbidden:', error.response?.data?.error || error.response?.data?.message);
      } else {
        console.log('   ❌ Error:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testComplaintEndpoint();
