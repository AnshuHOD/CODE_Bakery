// imageMapper.js — Maps product name keywords and category to high-quality Unsplash image URLs

const BAKERY_IMAGES = {
  cake: {
    chocolate: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600',
    truffle: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600',
    velvet: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?q=80&w=600',
    red: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?q=80&w=600',
    pineapple: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=600',
    strawberry: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600',
    blackforest: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600',
    cheesecake: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600',
    cheese: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600',
    vanilla: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=600',
    mango: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=600',
    fruit: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600',
    cupcake: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=600',
    default: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600'
  },
  pastry: {
    chocolate: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=600',
    cupcake: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=600',
    muffin: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=600',
    croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600',
    donut: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600',
    macaron: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=600',
    tart: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600',
    pie: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600',
    eclair: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=600',
    puff: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600',
    default: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=600'
  },
  bread: {
    sourdough: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=600',
    garlic: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=600',
    baguette: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600',
    white: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600',
    wheat: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600',
    multigrain: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600',
    bun: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600',
    default: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600'
  },
  cookie: {
    chocolate: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=600',
    oatmeal: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600',
    chocochip: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=600',
    cookie: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=600',
    default: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=600'
  },
  waffle: {
    default: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600'
  },
  pancake: {
    default: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600'
  },
  coffee: {
    cappuccino: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600',
    latte: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600',
    cold: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600',
    default: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600'
  },
  tea: {
    chai: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600',
    masala: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600',
    green: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600',
    default: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600'
  },
  other: {
    default: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600'
  }
};

/**
 * Maps a product name and category to a beautiful Unsplash URL.
 * @param {string} name - Product name (e.g. "Chocolate Truffle Cake")
 * @param {string} category - Category (e.g. "cake")
 * @returns {string} - Unsplash image URL
 */
const getMappedImage = (name = '', category = 'other') => {
  const normName = (name || '').toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const cat = BAKERY_IMAGES[category] ? category : 'other';
  const catImages = BAKERY_IMAGES[cat];

  // Search for matching keyword in the name
  for (const keyword of Object.keys(catImages)) {
    if (keyword !== 'default' && normName.includes(keyword)) {
      return catImages[keyword];
    }
  }

  // Cross-category keywords as secondary check
  if (normName.includes('waffle')) return BAKERY_IMAGES.waffle.default;
  if (normName.includes('pancake')) return BAKERY_IMAGES.pancake.default;
  if (normName.includes('coffee') || normName.includes('latte') || normName.includes('cappuccino') || normName.includes('espresso') || normName.includes('cold coffee')) return BAKERY_IMAGES.coffee.default;
  if (normName.includes('tea') || normName.includes('chai')) return BAKERY_IMAGES.tea.default;
  if (normName.includes('chocolate')) return BAKERY_IMAGES.cake.chocolate;
  if (normName.includes('velvet')) return BAKERY_IMAGES.cake.velvet;
  if (normName.includes('pineapple')) return BAKERY_IMAGES.cake.pineapple;
  if (normName.includes('strawberry') || normName.includes('berry')) return BAKERY_IMAGES.cake.strawberry;
  if (normName.includes('croissant')) return BAKERY_IMAGES.pastry.croissant;
  if (normName.includes('sourdough')) return BAKERY_IMAGES.bread.sourdough;
  if (normName.includes('cookie')) return BAKERY_IMAGES.cookie.default;

  return catImages.default;
};

module.exports = { getMappedImage };
