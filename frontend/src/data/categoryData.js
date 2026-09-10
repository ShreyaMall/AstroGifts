// ── src/data/categoryData.js ──
// Product data for all 10 categories imported from src/assets/

// Chair images
import chair1  from '../assets/chair1.jpg';
import chair2  from '../assets/chair2.jpg';
import chair3  from '../assets/chair3.jpg';
import chair4  from '../assets/chair4.jpg';
import chair5  from '../assets/chair5.jpg';
import chair6  from '../assets/chair6.jpg';
import chair7  from '../assets/chair7.jpg';
import chair8  from '../assets/chair8.jpg';
import chair9  from '../assets/chair9.jpg';
import chair10 from '../assets/chair10.jpg';

// Armchair images
import armchair1 from '../assets/armchair1.jpg';
import armchair2 from '../assets/armchair2.jpg';
import armchair3 from '../assets/armchair3.jpg';
import armchair4 from '../assets/armchair4.jpg';
import armchair5 from '../assets/armchair5.jpg';
import armchair6 from '../assets/armchair6.jpg';
import armchair7 from '../assets/armchair7.jpg';
import armchair8 from '../assets/armchair8.jpg';

// Table images
import table2  from '../assets/table2.jpg';
import table3  from '../assets/table3.jpg';
import table4  from '../assets/table4.jpg';
import table5  from '../assets/table5.jpg';
import table6  from '../assets/table6.jpg';
import table7  from '../assets/table7.jpg';
import table8  from '../assets/table8.jpg';
import table9  from '../assets/table9.jpg';
import table10 from '../assets/table10.webp';

// Sofa images
import sofa1 from '../assets/sofa1.jpg';
import sofa2 from '../assets/sofa2.jpg';
import sofa3 from '../assets/sofa3.jpg';
import sofa4 from '../assets/sofa4.jpg';
import sofa5 from '../assets/sofa5.jpg';
import sofa6 from '../assets/sofa6.jpg';
import sofa7 from '../assets/sofa7.jpg';
import sofa8 from '../assets/sofa8.jpg';
import sofa9 from '../assets/sofa9.jpg';

// Bed images
import bed1 from '../assets/bed1.jpg';
import bed2 from '../assets/bed2.jpg';
import bed3 from '../assets/bed3.jpg';
import bed4 from '../assets/bed4.jpg';
import bed5 from '../assets/bed5.jpg';
import bed6 from '../assets/bed6.jpg';
import bed7 from '../assets/bed7.jpg';

// Storage images
import storage1 from '../assets/storage1.jpg';
import storage2 from '../assets/storage2.jpg';
import storage3 from '../assets/storage3.jpg';
import storage4 from '../assets/storage4.jpg';
import storage5 from '../assets/storage5.jpg';
import storage6 from '../assets/storage6.jpg';
import storage7 from '../assets/storage7.jpg';
import storage8 from '../assets/storage8.jpg';

// Textile images
import textile1 from '../assets/textile1.webp';
import textile2 from '../assets/textile2.jpg';
import textile3 from '../assets/textile3.jpg';
import textile4 from '../assets/textile4.jpg';
import textile5 from '../assets/textile5.jpg';
import textile6 from '../assets/textile6.webp';
import textile7 from '../assets/textile7.webp';
import textile8 from '../assets/textile8.webp';

// Lighting images
import light1 from '../assets/light1.jpg';
import light2 from '../assets/light2.jpg';
import light3 from '../assets/light3.jpg';
import light4 from '../assets/light4.jpg';
import light6 from '../assets/light6.jpg';
import light7 from '../assets/light7.jpg';
import light8 from '../assets/light8.jpg';
import light9 from '../assets/light9.jpg';

// Toy images
import toy1 from '../assets/toy1.jpg';
import toy2 from '../assets/toy2.jpg';
import toy3 from '../assets/toy3.jpg';
import toy4 from '../assets/toy4.jpg';
import toy5 from '../assets/toy5.jpg';
import toy6 from '../assets/toy6.jpg';
import toy7 from '../assets/toy7.jpg';

// Decor images
import decor1 from '../assets/decor1.jpg';
import decor2 from '../assets/decor2.jpg';
import decor3 from '../assets/decor3.jpg';
import decor4 from '../assets/decor4.jpg';
import decor5 from '../assets/decor5.jpg';
import decor6 from '../assets/decor6.jpg';
import decor7 from '../assets/decor7.jpg';
import decor8 from '../assets/decor8.webp';

export const CATEGORIES = [
  { slug: 'chairs',    name: 'Chairs',    icon: '🪑' },
  { slug: 'tables',    name: 'Tables',    icon: '🪵' },
  { slug: 'sofas',     name: 'Sofas',     icon: '🛋️' },
  { slug: 'armchairs', name: 'Armchairs', icon: '💺' },
  { slug: 'beds',      name: 'Beds',      icon: '🛏️' },
  { slug: 'storage',   name: 'Storage',   icon: '🗄️' },
  { slug: 'textiles',  name: 'Textiles',  icon: '🧵' },
  { slug: 'lighting',  name: 'Lighting',  icon: '💡' },
  { slug: 'toys',      name: 'Toys',      icon: '🧸' },
  { slug: 'decor',     name: 'Decor',     icon: '🪴' },
];

const makeProducts = (category, items) =>
  items.map((item, i) => ({ ...item, id: `${category}-${i + 1}`, category }));

export const CATEGORY_PRODUCTS = {
  chairs: makeProducts('Chairs', [
    { name: 'Revolt', price: 275, oldPrice: null, rating: 5, badge: 'NEW', image: chair1, colors: ['#1c1c1c', '#e8e0d4'], brand: 'HAY', material: 'Metal', color: 'American Silver' },
    { name: 'Avana', price: 458, oldPrice: 538, rating: 5, badge: '-15%', badgeType:'sale', image: chair2, colors: ['#7d7d7d', '#2c2c2c'], brand: 'Poliform', material: 'Fabric', color: 'Gray' },
    { name: 'Sophie', price: 520, oldPrice: null, rating: 5, badge: null, image: chair3, colors: ['#c8c0b0', '#1c1c1c'], brand: 'Vitra', material: 'Leather', color: 'Bone' },
    { name: 'Petit', price: 327, oldPrice: null, rating: 4.5, badge: null, image: chair4, colors: ['#e8e0d4', '#888'], brand: 'HAY', material: 'Wood', color: 'American Silver' },
    { name: 'Curve', price: 320, oldPrice: null, rating: 4.5, badge: null, image: chair5, colors: ['#4a6741', '#c8c0b0'], brand: 'Vitra', material: 'Fabric', color: 'Green' },
    { name: '16 Side', price: 295, oldPrice: null, rating: 4, badge: null, image: chair6, colors: ['#1c1c1c', '#2c2c2c'], brand: 'HAY', material: 'Plastic', color: 'Jet' },
    { name: '12 Side', price: 339, oldPrice: 375, rating: 4.5, badge: '-10%', badgeType:'sale', image: chair7, colors: ['#6fa8a0', '#e8e0d4'], brand: 'Poliform', material: 'Plastic', color: 'Dark Gray' },
    { name: 'Soft Edge', price: 440, oldPrice: null, rating: 4, badge: null, image: chair8, colors: ['#e8d8b0', '#1c1c1c', '#b22'], brand: 'Vitra', material: 'Wood', color: 'Bone' },
    { name: 'Result', price: 279, oldPrice: 310, rating: 4.5, badge: '-10%', badgeType:'sale', image: chair9, colors: ['#c8a870', '#1c1c1c'], brand: 'HAY', material: 'Wood', color: 'Bone' },
    { name: 'Hal Wood', price: 625, oldPrice: null, rating: 5, badge: null, image: chair10, colors: ['#7d7d7d'], brand: 'Vitra', material: 'Wood', color: 'Gray' },
    { name: 'Fauteuil Direction', price: 372, oldPrice: null, rating: 4, badge: null, image: chair1, colors: ['#1c1c1c'], brand: 'Poliform', material: 'Leather', color: 'Jet' },
    { name: 'Frames Upholstered', price: 399, oldPrice: null, rating: 4.5, badge: null, image: chair2, colors: ['#e8e0d4', '#888'], brand: 'HAY', material: 'Fabric', color: 'American Silver' },
  ]),

  tables: makeProducts('Tables', [
    { name: 'Bitta', price: 1519, oldPrice: 1680, rating: 5, badge: '-10%', badgeType:'sale', image: table2, colors: ['#1c1c1c', '#e8e0d4'], brand: 'Kettal', material: 'Metal', color: 'Dark Gray' },
    { name: 'Giro LR', price: 890, oldPrice: null, rating: 5, badge: 'NEW', image: table3, colors: ['#c8a870', '#1c1c1c'], brand: 'Kettal', material: 'Wood', color: 'Bone' },
    { name: 'Tulip Round', price: 1200, oldPrice: null, rating: 4.5, badge: null, image: table4, colors: ['#ffffff', '#1c1c1c'], brand: 'Poliform', material: 'Metal', color: 'American Silver' },
    { name: 'String Shelving', price: 650, oldPrice: null, rating: 4, badge: null, image: table5, colors: ['#7d7d7d'], brand: 'HAY', material: 'Metal', color: 'Gray' },
    { name: 'Oak Dining', price: 980, oldPrice: 1150, rating: 5, badge: '-15%', badgeType:'sale', image: table6, colors: ['#c8a870', '#888'], brand: 'Vitra', material: 'Wood', color: 'Bone' },
    { name: 'Marble Coffee', price: 760, oldPrice: null, rating: 4.5, badge: null, image: table7, colors: ['#e8e0d4', '#1c1c1c'], brand: 'Poliform', material: 'Metal', color: 'American Silver' },
    { name: 'Hairpin Legs', price: 420, oldPrice: null, rating: 4, badge: 'NEW', image: table8, colors: ['#1c1c1c', '#c0622a'], brand: 'HAY', material: 'Metal', color: 'Dark Gray' },
    { name: 'Walnut Extendable', price: 1340, oldPrice: null, rating: 5, badge: null, image: table9, colors: ['#8b6340'], brand: 'Vitra', material: 'Wood', color: 'Bone' },
    { name: 'Slab Side Table', price: 380, oldPrice: 420, rating: 4, badge: '-10%', badgeType:'sale', image: table10, colors: ['#e8e0d4', '#7d7d7d'], brand: 'Kettal', material: 'Wood', color: 'Gray' },
  ]),

  sofas: makeProducts('Sofas', [
    { name: 'Belt Armchair', price: 2150, oldPrice: null, rating: 5, badge: 'NEW', image: sofa1, colors: ['#e8e0d4', '#7d7d7d', '#1c1c1c'], brand: 'Kettal', material: 'Fabric', color: 'Bone' },
    { name: 'Camaleonda', price: 3800, oldPrice: null, rating: 5, badge: null, image: sofa2, colors: ['#c8a870', '#1c1c1c'], brand: 'B&B Italia', material: 'Leather', color: 'Bone' },
    { name: 'Cloud Sofa', price: 2900, oldPrice: 3400, rating: 4.5, badge: '-15%', badgeType:'sale', image: sofa3, colors: ['#6fa8a0', '#e8e0d4'], brand: 'Poliform', material: 'Fabric', color: 'Gray' },
    { name: 'LC2 Sofa', price: 4200, oldPrice: null, rating: 5, badge: null, image: sofa4, colors: ['#1c1c1c', '#888'], brand: 'Cassina', material: 'Leather', color: 'Jet' },
    { name: 'Grand Repos', price: 3100, oldPrice: null, rating: 4.5, badge: null, image: sofa5, colors: ['#c8a870'], brand: 'Vitra', material: 'Fabric', color: 'Bone' },
    { name: 'Tufty Too', price: 2600, oldPrice: 2900, rating: 4, badge: '-10%', badgeType:'sale', image: sofa6, colors: ['#888', '#1c1c1c'], brand: 'B&B Italia', material: 'Fabric', color: 'Gray' },
    { name: 'DS-600', price: 5500, oldPrice: null, rating: 5, badge: 'HOT', image: sofa7, colors: ['#7d7d7d', '#e8e0d4', '#2c2c2c'], brand: 'De Sede', material: 'Leather', color: 'Gray' },
    { name: 'Florence Knoll', price: 3300, oldPrice: null, rating: 4.5, badge: null, image: sofa8, colors: ['#1c1c1c', '#6fa8a0'], brand: 'Knoll', material: 'Fabric', color: 'Jet' },
    { name: 'Mags Soft', price: 1980, oldPrice: 2200, rating: 4, badge: '-10%', badgeType:'sale', image: sofa9, colors: ['#e8d8b0', '#888'], brand: 'HAY', material: 'Fabric', color: 'Bone' },
  ]),

  armchairs: makeProducts('Armchairs', [
    { name: 'Eames Lounge', price: 4500, oldPrice: null, rating: 5, badge: 'NEW', image: armchair1, colors: ['#1c1c1c', '#c8a870'], brand: 'Vitra', material: 'Leather', color: 'Jet' },
    { name: 'Egg Chair', price: 3800, oldPrice: null, rating: 5, badge: null, image: armchair2, colors: ['#888', '#1c1c1c', '#e8e0d4'], brand: 'Fritz Hansen', material: 'Fabric', color: 'Gray' },
    { name: 'Panton Chair', price: 620, oldPrice: null, rating: 4.5, badge: null, image: armchair3, colors: ['#c0622a', '#1c1c1c', '#e8e0d4'], brand: 'Vitra', material: 'Plastic', color: 'Bone' },
    { name: 'Womb Chair', price: 2900, oldPrice: 3200, rating: 5, badge: '-10%', badgeType:'sale', image: armchair4, colors: ['#6fa8a0', '#888'], brand: 'Knoll', material: 'Fabric', color: 'Green' },
    { name: 'Ball Chair', price: 3400, oldPrice: null, rating: 4, badge: null, image: armchair5, colors: ['#ffffff', '#1c1c1c'], brand: 'Adelta', material: 'Plastic', color: 'American Silver' },
    { name: 'Coconut Chair', price: 2100, oldPrice: null, rating: 4.5, badge: 'HOT', image: armchair6, colors: ['#e8e0d4', '#1c1c1c'], brand: 'Vitra', material: 'Fabric', color: 'Bone' },
    { name: 'Prouvé RAW', price: 1800, oldPrice: 2000, rating: 4.5, badge: '-10%', badgeType:'sale', image: armchair7, colors: ['#7d7d7d', '#c8a870'], brand: 'Vitra', material: 'Metal', color: 'Gray' },
    { name: 'Bok Lounge', price: 1650, oldPrice: null, rating: 4, badge: null, image: armchair8, colors: ['#c8a870'], brand: 'Fogia', material: 'Wood', color: 'Bone' },
  ]),

  beds: makeProducts('Beds', [
    { name: 'Angle Bed', price: 1850, oldPrice: null, rating: 5, badge: 'NEW', image: bed1, colors: ['#e8e0d4', '#888'], brand: 'Poliform', material: 'Fabric', color: 'Bone' },
    { name: 'Flou Nathalie', price: 2400, oldPrice: null, rating: 5, badge: null, image: bed2, colors: ['#1c1c1c', '#e8e0d4'], brand: 'Flou', material: 'Leather', color: 'Jet' },
    { name: 'Porro Fil Bed', price: 3100, oldPrice: 3400, rating: 4.5, badge: '-10%', badgeType:'sale', image: bed3, colors: ['#888', '#c8a870'], brand: 'Porro', material: 'Wood', color: 'Gray' },
    { name: 'Hug Bed', price: 2750, oldPrice: null, rating: 4.5, badge: null, image: bed4, colors: ['#e8d8b0', '#7d7d7d'], brand: 'Bonaldo', material: 'Fabric', color: 'Bone' },
    { name: 'Amami Bed', price: 1990, oldPrice: null, rating: 4, badge: 'HOT', image: bed5, colors: ['#6fa8a0', '#1c1c1c'], brand: 'Poliform', material: 'Fabric', color: 'Green' },
    { name: 'Tatlin Bed', price: 4200, oldPrice: null, rating: 5, badge: null, image: bed6, colors: ['#c8a870', '#1c1c1c'], brand: 'Flou', material: 'Leather', color: 'Bone' },
    { name: 'Casanova Bed', price: 3600, oldPrice: 4000, rating: 4.5, badge: '-10%', badgeType:'sale', image: bed7, colors: ['#e8e0d4', '#888'], brand: 'Bonaldo', material: 'Fabric', color: 'American Silver' },
  ]),

  storage: makeProducts('Storage', [
    { name: 'Fami Shelf', price: 890, oldPrice: null, rating: 4.5, badge: 'NEW', image: storage1, colors: ['#e8e0d4', '#1c1c1c'], brand: 'HAY', material: 'Metal', color: 'American Silver' },
    { name: 'String System', price: 1200, oldPrice: null, rating: 5, badge: null, image: storage2, colors: ['#7d7d7d', '#c8a870'], brand: 'String Furniture', material: 'Wood', color: 'Gray' },
    { name: 'USM Haller', price: 2600, oldPrice: 2900, rating: 5, badge: '-10%', badgeType:'sale', image: storage3, colors: ['#888', '#1c1c1c', '#c0622a'], brand: 'USM', material: 'Metal', color: 'Gray' },
    { name: 'Vitsoe 606', price: 1800, oldPrice: null, rating: 4.5, badge: null, image: storage4, colors: ['#e8e0d4', '#888'], brand: 'Vitsoe', material: 'Metal', color: 'Bone' },
    { name: 'Media Unit', price: 1100, oldPrice: null, rating: 4, badge: null, image: storage5, colors: ['#c8a870', '#1c1c1c'], brand: 'Poliform', material: 'Wood', color: 'Bone' },
    { name: 'Wardrobe T20', price: 3400, oldPrice: 3800, rating: 5, badge: '-10%', badgeType:'sale', image: storage6, colors: ['#ffffff', '#888'], brand: 'Poliform', material: 'Wood', color: 'American Silver' },
    { name: 'Sideboard Vera', price: 1950, oldPrice: null, rating: 4.5, badge: 'HOT', image: storage7, colors: ['#c8a870'], brand: 'Kettal', material: 'Wood', color: 'Bone' },
    { name: 'Toy Shelf', price: 760, oldPrice: null, rating: 4, badge: null, image: storage8, colors: ['#6fa8a0', '#c0622a', '#1c1c1c'], brand: 'Vitra', material: 'Metal', color: 'Green' },
  ]),

  textiles: makeProducts('Textiles', [
    { name: 'Wool Blanket', price: 195, oldPrice: null, rating: 5, badge: 'NEW', image: textile1, colors: ['#e8e0d4', '#6fa8a0', '#888'], brand: 'HAY', material: 'Wool', color: 'Bone' },
    { name: 'Cotton Throw', price: 125, oldPrice: null, rating: 4.5, badge: null, image: textile2, colors: ['#e8d8b0', '#1c1c1c'], brand: 'Hay', material: 'Cotton', color: 'Bone' },
    { name: 'Kilim Rug', price: 480, oldPrice: 560, rating: 4.5, badge: '-15%', badgeType:'sale', image: textile3, colors: ['#c0622a', '#888', '#e8d8b0'], brand: 'Loloi', material: 'Wool', color: 'Bone' },
    { name: 'Linen Cushion', price: 85, oldPrice: null, rating: 4, badge: null, image: textile4, colors: ['#e8e0d4', '#7d7d7d'], brand: 'HAY', material: 'Linen', color: 'American Silver' },
    { name: 'Silk Curtains', price: 340, oldPrice: null, rating: 4.5, badge: null, image: textile5, colors: ['#e8d8b0', '#888'], brand: 'Poliform', material: 'Silk', color: 'Bone' },
    { name: 'Jute Mat', price: 165, oldPrice: 200, rating: 4, badge: '-18%', badgeType:'sale', image: textile6, colors: ['#c8a870'], brand: 'Loloi', material: 'Rattan', color: 'Bone' },
    { name: 'Sheepskin Rug', price: 290, oldPrice: null, rating: 5, badge: 'HOT', image: textile7, colors: ['#ffffff', '#888'], brand: 'HAY', material: 'Wool', color: 'American Silver' },
    { name: 'Velvet Pillow', price: 95, oldPrice: null, rating: 4, badge: null, image: textile8, colors: ['#6fa8a0', '#c0622a', '#1c1c1c'], brand: 'Poliform', material: 'Fabric', color: 'Green' },
  ]),

  lighting: makeProducts('Lighting', [
    { name: 'AJ Table Lamp', price: 680, oldPrice: null, rating: 5, badge: 'NEW', image: light1, colors: ['#1c1c1c', '#c0622a'], brand: 'Louis Poulsen', material: 'Metal', color: 'Jet' },
    { name: 'PH 5 Pendant', price: 920, oldPrice: null, rating: 5, badge: null, image: light2, colors: ['#c0622a', '#c8a870', '#888'], brand: 'Louis Poulsen', material: 'Metal', color: 'Bone' },
    { name: 'Arco Floor Lamp', price: 1850, oldPrice: 2100, rating: 4.5, badge: '-12%', badgeType:'sale', image: light3, colors: ['#e8e0d4', '#888'], brand: 'Flos', material: 'Metal', color: 'American Silver' },
    { name: 'Bestlite Table', price: 540, oldPrice: null, rating: 4.5, badge: null, image: light4, colors: ['#1c1c1c', '#c0622a', '#888'], brand: 'Gubi', material: 'Metal', color: 'Jet' },
    { name: 'Flowerpot VP9', price: 380, oldPrice: null, rating: 4, badge: 'HOT', image: light6, colors: ['#6fa8a0', '#c0622a', '#e8d8b0'], brand: 'AndTradition', material: 'Metal', color: 'Green' },
    { name: 'Snoopy Table', price: 760, oldPrice: 850, rating: 4.5, badge: '-11%', badgeType:'sale', image: light7, colors: ['#ffffff', '#1c1c1c'], brand: 'Flos', material: 'Metal', color: 'American Silver' },
    { name: 'Taccia Table', price: 1100, oldPrice: null, rating: 5, badge: null, image: light8, colors: ['#e8e0d4'], brand: 'Flos', material: 'Metal', color: 'American Silver' },
    { name: 'NJP Table Lamp', price: 490, oldPrice: null, rating: 4, badge: null, image: light9, colors: ['#1c1c1c', '#888', '#c8a870'], brand: 'Louis Poulsen', material: 'Metal', color: 'Jet' },
  ]),

  toys: makeProducts('Toys', [
    { name: 'Naef Spiel', price: 195, oldPrice: null, rating: 5, badge: 'NEW', image: toy1, colors: ['#c0622a', '#6fa8a0', '#e8d8b0'], brand: 'Naef', material: 'Wood', color: 'Bone' },
    { name: 'Lego Architecture', price: 89, oldPrice: null, rating: 4.5, badge: null, image: toy2, colors: ['#1c1c1c', '#e8d8b0'], brand: 'Lego', material: 'Plastic', color: 'Jet' },
    { name: 'Wooden Train Set', price: 145, oldPrice: 180, rating: 4.5, badge: '-20%', badgeType:'sale', image: toy3, colors: ['#c8a870', '#c0622a'], brand: 'HAY', material: 'Wood', color: 'Bone' },
    { name: 'Puppet Theatre', price: 320, oldPrice: null, rating: 4, badge: null, image: toy4, colors: ['#6fa8a0', '#c0622a', '#e8d8b0'], brand: 'Naef', material: 'Wood', color: 'Green' },
    { name: 'Balance Board', price: 175, oldPrice: null, rating: 5, badge: 'HOT', image: toy5, colors: ['#c8a870'], brand: 'Wobbel', material: 'Wood', color: 'Bone' },
    { name: 'Stacking Tower', price: 65, oldPrice: 80, rating: 4, badge: '-20%', badgeType:'sale', image: toy6, colors: ['#6fa8a0', '#c0622a', '#e8d8b0', '#888'], brand: 'Naef', material: 'Wood', color: 'Green' },
    { name: 'Rocking Horse', price: 485, oldPrice: null, rating: 5, badge: null, image: toy7, colors: ['#c8a870', '#1c1c1c'], brand: 'Moulin Roty', material: 'Wood', color: 'Bone' },
  ]),

  decor: makeProducts('Decor', [
    { name: 'Relief Bowl', price: 145, oldPrice: null, rating: 5, badge: 'NEW', image: decor1, colors: ['#e8e0d4', '#7d7d7d'], brand: 'HAY', material: 'Metal', color: 'American Silver' },
    { name: 'Aalto Vase', price: 210, oldPrice: null, rating: 5, badge: null, image: decor2, colors: ['#6fa8a0', '#888', '#e8e0d4'], brand: 'Iittala', material: 'Glass', color: 'Green' },
    { name: 'Muuto Leaf Lamp', price: 390, oldPrice: 450, rating: 4.5, badge: '-14%', badgeType:'sale', image: decor3, colors: ['#c8a870', '#888'], brand: 'Muuto', material: 'Metal', color: 'Bone' },
    { name: 'Ceramic Planter', price: 95, oldPrice: null, rating: 4, badge: null, image: decor4, colors: ['#e8e0d4', '#6fa8a0', '#888'], brand: 'HAY', material: 'Ceramic', color: 'American Silver' },
    { name: 'Kähler Fiora', price: 168, oldPrice: null, rating: 4.5, badge: 'HOT', image: decor5, colors: ['#c8a870', '#1c1c1c'], brand: 'Kähler', material: 'Ceramic', color: 'Bone' },
    { name: 'Wire Basket', price: 78, oldPrice: 95, rating: 4, badge: '-18%', badgeType:'sale', image: decor6, colors: ['#1c1c1c', '#888'], brand: 'Hay', material: 'Metal', color: 'Jet' },
    { name: 'Candle Holders Set', price: 125, oldPrice: null, rating: 5, badge: null, image: decor7, colors: ['#e8e0d4', '#c8a870', '#1c1c1c'], brand: 'HAY', material: 'Metal', color: 'American Silver' },
    { name: 'Framed Art Print', price: 185, oldPrice: null, rating: 4.5, badge: null, image: decor8, colors: ['#e8e0d4'], brand: 'Muuto', material: 'Wood', color: 'Bone' },
  ]),
};

// Hero banner gradient colors per category
export const ALL_PRODUCTS = Object.values(CATEGORY_PRODUCTS).flat();

export const findProductByIdOrSlug = (identifier) => {
  if (!identifier) return null;
  const target = String(identifier).toLowerCase().trim();
  return ALL_PRODUCTS.find(p => 
    String(p.id).toLowerCase() === target ||
    p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === target ||
    p.name.toLowerCase() === target
  ) || null;
};

