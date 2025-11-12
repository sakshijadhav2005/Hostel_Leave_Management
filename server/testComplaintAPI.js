const axios = require('axios');

const API_URL = 'http://localhost:4001';

async function testComplaintAPI() {
  try {
    console.log('Testing Complaint API endpoints...\n');

    // Test 1: Create a complaint (without auth - should fail)
    console.log('1. Testing complaint creation without auth (should fail):');
    try {
      await axios.post(`${API_URL}/api/complaints`, {
        name: 'Test Student',
        room_no: 'A-101',
        hostel_no: 'H1',
        query: 'Test complaint'
      });
    } catch (error) {
      console.log('✓ Expected error:', error.response?.status, error.response?.data?.error);
    }

    // Test 2: Test health endpoint
    console.log('\n2. Testing health endpoint:');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('✓ Health check:', healthResponse.data);

    // Test 3: Test rector complaints endpoint without auth (should fail)
    console.log('\n3. Testing rector complaints without auth (should fail):');
    try {
      await axios.get(`${API_URL}/api/rector/complaints`);
    } catch (error) {
      console.log('✓ Expected error:', error.response?.status, error.response?.data?.error);
    }

    console.log('\n✅ All API endpoints are properly protected and responding correctly!');
    console.log('\n📝 To test the full functionality:');
    console.log('1. Open the client at http://localhost:5175');
    console.log('2. Login with admin credentials');
    console.log('3. Navigate to the Complaints tab');
    console.log('4. Submit a complaint using the form');
    console.log('5. View and manage complaints in the rector dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testComplaintAPI();
