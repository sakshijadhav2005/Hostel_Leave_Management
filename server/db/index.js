const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
let retries = 0;

async function connect() {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    retries = 0;
  } catch (error) {
    retries += 1;
    const delay = Math.min(30000, 2000 * retries);
    console.error(`MongoDB connection failed (attempt ${retries}): ${error.message}. Retrying in ${Math.round(delay/1000)}s...`);
    setTimeout(connect, delay);
  }
}

const connectDB = () => {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not set. Please configure server/.env");
    console.log("Server will start without database connection (for development only)");
    return;
  }
  connect();
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Reconnecting...');
    connect();
  });
};

module.exports = connectDB;
