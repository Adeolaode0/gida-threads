const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'gida_store.db');
const db = new sqlite3.Database(DB_PATH);

const products = [
  {
    name: 'GIDA "Star" Distressed Heavyweight Tee',
    slug: 'gida-star-distressed-tee',
    category: 'tees',
    price: 88.00,
    original_price: 115.00,
    description: 'Hand-distressed vintage buttercream heavyweight cotton tee with signature cut-out chest accent. Embellished with the iconic G†DA star/cross typography, "glide through" atelier micro-print, raw hand-frayed distressed hem, and distressed collar.',
    details: JSON.stringify([
      '280 GSM vintage-washed combed jersey cotton',
      'Custom hand-distressed raw frayed hemline and neckline',
      'Signature cut-out chest ventilation accent with "glide through" print',
      'Dense black matte G†DA star emblem screen print',
      'Preshrunk relaxed boxy drape'
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Buttercream Yellow', hex: '#f3e7c4' },
      { name: 'Vintage Chalk', hex: '#e5dfd5' }
    ]),
    in_stock: 1,
    stock_quantity: 24,
    image_url: '/images/gida_distressed_tee.png',
    badge: 'Signature Star Drop',
    rating: 4.97,
    reviews_count: 128
  },
  {
    name: 'GIDA Abstract Contour Wireframe Tee',
    slug: 'gida-abstract-contour-wireframe-tee',
    category: 'tees',
    price: 82.00,
    original_price: 105.00,
    description: 'Oversized luxury heavyweight black tee featuring Gida\'s continuous-contour geometric wireframe artwork in electric cyan, coral orange, and chalk white, finished with the teal GIDA atelier signature.',
    details: JSON.stringify([
      '260 GSM single jersey ultra-dense combed cotton',
      'Multi-pass architectural contour print in cyan, coral, and white',
      'Teal GIDA typography signature on lower chest',
      'Ribbed high-collar crew neck that maintains structure',
      'Oversized boxy cut designed in Paris atelier'
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Onyx Black', hex: '#111215' }
    ]),
    in_stock: 1,
    stock_quantity: 35,
    image_url: '/images/gida_abstract_tee.png',
    badge: 'New Release',
    rating: 4.92,
    reviews_count: 89
  },
  {
    name: '"I Told ChatGPT About U" Heavyweight Hoodie',
    slug: 'i-told-chatgpt-about-u-hoodie',
    category: 'hoodies',
    price: 165.00,
    original_price: 195.00,
    description: 'Iconic culture statement piece. Heavyweight 480 GSM French Terry cotton hoodie with bold architectural hand-drawn typography back print "I TOLD CHATGPT ABOUT U". Engineered with a structured crossover double-lined hood.',
    details: JSON.stringify([
      '480 GSM custom milled heavyweight French Terry fleece',
      'Signature bold white back typographic statement print',
      'Architectural double-layer hood that sits tall without drawstrings',
      'Double-needle reinforcement on all stress points',
      'Heavy 2x2 ribbed cuffs and waistband for perpetual shape'
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Midnight Black', hex: '#0c0d10' }
    ]),
    in_stock: 1,
    stock_quantity: 16,
    image_url: '/images/chatgpt_hoodie.png',
    badge: 'Viral Statement',
    rating: 4.99,
    reviews_count: 214
  },
  {
    name: '"2% Low Battery" Heavyweight Hoodie',
    slug: 'low-battery-heavyweight-hoodie',
    category: 'hoodies',
    price: 155.00,
    original_price: 185.00,
    description: 'High-fashion boxy hoodie in dense jet black cotton fleece featuring an iconic minimalist embroidered "2%" low battery status indicator on the left chest. Delivers ultimate avant-garde street comfort.',
    details: JSON.stringify([
      '480 GSM high-density organic cotton fleece',
      'Precision embroidered red & optic white 2% battery status glyph',
      'Sculpted drop-shoulder oversized streetwear silhouette',
      'Deep kangaroo hand-warmer pocket',
      'Custom vintage enzyme wash with anti-pilling finish'
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Jet Black', hex: '#0b0c0e' }
    ]),
    in_stock: 1,
    stock_quantity: 19,
    image_url: '/images/lowbattery_hoodie.png',
    badge: 'Atelier Drop',
    rating: 4.95,
    reviews_count: 104
  }
];

db.serialize(() => {
  db.run('DELETE FROM products', (err) => {
    if (err) console.error(err);
    console.log('Cleared existing products.');

    const stmt = db.prepare(`
      INSERT INTO products (name, slug, category, price, original_price, description, details, sizes, colors, in_stock, stock_quantity, image_url, badge, rating, reviews_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(p => {
      stmt.run(
        p.name,
        p.slug,
        p.category,
        p.price,
        p.original_price,
        p.description,
        p.details,
        p.sizes,
        p.colors,
        p.in_stock,
        p.stock_quantity,
        p.image_url,
        p.badge,
        p.rating,
        p.reviews_count
      );
    });

    stmt.finalize(() => {
      console.log('Successfully inserted all 4 user designs!');
      db.all('SELECT id, name, price, image_url FROM products', (err, rows) => {
        console.log('Verification count:', rows.length);
        rows.forEach(r => console.log(` - [${r.id}] ${r.name} ($${r.price}) -> ${r.image_url}`));
        db.close();
      });
    });
  });
});
