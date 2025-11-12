const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testUserData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_leave');
    console.log('Connected to MongoDB');

    // Find all users and check their data
    const users = await User.find({}).lean();
    console.log('\n📊 User Data Analysis:');
    console.log(`Total users: ${users.length}`);

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name || 'MISSING'}`);
      console.log(`  Room No: ${user.room_no || 'MISSING'}`);
      console.log(`  Hostel No: ${user.hostel_no || 'MISSING'}`);
      console.log(`  Role: ${user.role}`);
      
      const hasAllFields = user.name && user.room_no && user.hostel_no;
      console.log(`  Complete Profile: ${hasAllFields ? '✅' : '❌'}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testUserData();
