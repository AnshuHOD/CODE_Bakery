// seed.js — Seeds initial products into the MongoDB database
// Run using: node seed.js inside backend directory

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const initialProducts = [
  {
    name: 'Chocolate Truffle Cake',
    description: 'Rich chocolate sponge layered with smooth chocolate ganache and finished with premium truffles. Super moist!',
    category: 'cake',
    pricePerKg: 850,
    minSizeKg: 0.5,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600',
    tags: ['bestseller', 'eggless', 'chocolate']
  },
  {
    name: 'Red Velvet Classic Cake',
    description: 'Classic velvety red sponge with delicious premium cream cheese frosting layers. A royal treat!',
    category: 'cake',
    pricePerKg: 950,
    minSizeKg: 1.0,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?q=80&w=600',
    tags: ['bestseller', 'cream-cheese', 'anniversary']
  },
  {
    name: 'Blueberry Pastry',
    description: 'Light and airy vanilla cake base layers filled with sweetened whipping cream and tangy blueberry compote.',
    category: 'pastry',
    pricePerKg: 120, // Price is treated as item price if category is pastry/bread
    minSizeKg: 1, // Treat as quantity multiplier
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=600',
    tags: ['pastry', 'blueberry', 'eggless']
  },
  {
    name: 'Artisanal Sourdough Bread',
    description: 'Freshly baked sourdough loaf with a crispy crust and soft chewy interior. Made using our wild starter.',
    category: 'bread',
    pricePerKg: 180,
    minSizeKg: 0.5,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=600',
    tags: ['bread', 'fresh', 'healthy', 'vegan']
  },
  {
    name: 'Double Choco Chip Cookies',
    description: 'Decadent chocolate cookies packed with dark and white chocolate chips. Soft-baked and gooey.',
    category: 'cookie',
    pricePerKg: 160,
    minSizeKg: 0.5,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=600',
    tags: ['cookie', 'chocolate', 'snack']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Existing products cleared');

    // Insert new products
    await Product.insertMany(initialProducts);
    console.log('🌱 Seeded initial products successfully');

    // Close Connection
    mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    process.exit(1);
  }
};

seedDatabase();
