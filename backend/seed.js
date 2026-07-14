// seed.js — Seeds initial products into the MongoDB database
// Run using: node seed.js inside backend directory

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const { getMappedImage } = require('./utils/imageMapper');

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
    name: 'Classic Vanilla Sponge',
    description: 'Fluffy vanilla sponge cake layered with sweet whipped cream and traditional vanilla cream frosting.',
    category: 'cake',
    pricePerKg: 750,
    minSizeKg: 0.5,
    available: true,
    imageUrl: 'images/cakes/vanilla_round.png',
    tags: ['classic', 'vanilla', 'eggless']
  },
  {
    name: 'Fresh Tropical Pineapple',
    description: 'Juicy pineapple chunks layered inside a moist vanilla sponge with fresh whipped cream and cherry toppings.',
    category: 'cake',
    pricePerKg: 800,
    minSizeKg: 0.5,
    available: true,
    imageUrl: 'images/cakes/pineapple_round.png',
    tags: ['pineapple', 'fruit', 'fresh']
  },
  {
    name: 'Sweet Wild Strawberry',
    description: 'Fresh wild strawberry compote layers with strawberry cream frosting on a soft pink sponge.',
    category: 'cake',
    pricePerKg: 850,
    minSizeKg: 0.5,
    available: true,
    imageUrl: 'images/cakes/strawberry_round.png',
    tags: ['strawberry', 'fruit', 'sweet']
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
  },
  {
    name: 'Classic Belgian Waffles',
    description: 'Crisp and golden waffles dusted with powdered sugar, served with pure maple syrup and whipped cream.',
    category: 'waffle',
    pricePerKg: 140,
    minSizeKg: 1,
    available: true,
    imageUrl: '', // Will auto-map to Unsplash waffle image
    tags: ['waffle', 'classic', 'fresh']
  },
  {
    name: 'Fluffy Buttermilk Pancakes',
    description: 'Three light and airy pancakes stacked high, topped with fresh berries and a dollop of honey-butter.',
    category: 'pancake',
    pricePerKg: 150,
    minSizeKg: 1,
    available: true,
    imageUrl: '', // Will auto-map to Unsplash pancake image
    tags: ['pancake', 'breakfast', 'bestseller']
  },
  {
    name: 'Masala Chai (MDU Special)',
    description: 'Freshly brewed Indian black tea infused with ginger, cardamom, cloves, and whole milk. A local favorite!',
    category: 'tea',
    pricePerKg: 40,
    minSizeKg: 1,
    available: true,
    imageUrl: '', // Will auto-map to Unsplash tea image
    tags: ['tea', 'local', 'hot']
  },
  {
    name: 'Classic Cappuccino',
    description: 'Rich espresso shot topped with a thick layer of velvety steamed milk foam and a dash of cocoa powder.',
    category: 'coffee',
    pricePerKg: 90,
    minSizeKg: 1,
    available: true,
    imageUrl: '', // Will auto-map to Unsplash coffee image
    tags: ['coffee', 'hot', 'artisanal']
  },
  {
    name: 'Classic Cold Coffee',
    description: 'Smooth, chilled coffee blended with milk and vanilla ice cream, topped with chocolate drizzle.',
    category: 'coffee',
    pricePerKg: 120,
    minSizeKg: 1,
    available: true,
    imageUrl: '', // Will auto-map to Unsplash cold coffee image
    tags: ['coffee', 'cold', 'bestseller']
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
    const initialProductsMapped = initialProducts.map(p => {
      if (!p.imageUrl || p.imageUrl.trim() === '') {
        p.imageUrl = getMappedImage(p.name, p.category);
      }
      return p;
    });
    await Product.insertMany(initialProductsMapped);
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
