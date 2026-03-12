const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn(`⚠️ No MONGODB_URI found. Database features will be disabled.`);
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000 // Don't hang forever if DB is down
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error. API features will fail: ${error.message}`);
    // Don't exit process so the frontend can still serve statically: process.exit(1);
  }
};

module.exports = connectDB;
