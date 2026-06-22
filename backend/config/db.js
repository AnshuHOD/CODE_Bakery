// db.js — MongoDB se connect karna
// Mongoose use karta hai. Ek baar connect hota hai, phir sab models
// automatically us connection ko use karte hain.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Connection fail hone par server band karo
  }
};

module.exports = connectDB;
