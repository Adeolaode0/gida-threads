const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'gida_store.db');
const db = new sqlite3.Database(DB_PATH);

// Initialize Tables and Seed Initial Data
function initDb() {
  db.serialize(() => {
    // 1. Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL,
        description TEXT NOT NULL,
        details TEXT,
        sizes TEXT NOT NULL,
        colors TEXT NOT NULL,
        in_stock INTEGER DEFAULT 1,
        stock_quantity INTEGER DEFAULT 25,
        image_url TEXT NOT NULL,
        back_image_url TEXT,
        badge TEXT,
        rating REAL DEFAULT 4.9,
        reviews_count INTEGER DEFAULT 84,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure back_image_url column exists for existing databases
    db.run(`ALTER TABLE products ADD COLUMN back_image_url TEXT`, () => {});

    // 2. Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        city TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        country TEXT NOT NULL,
        total_amount REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        payment_method TEXT DEFAULT 'Credit Card',
        status TEXT DEFAULT 'Confirmed',
        items_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Newsletter Subscribers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if products exist, otherwise seed
    db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
      if (err) {
        console.error('Error checking products table:', err);
        return;
      }

      if (row.count === 0) {
        console.log('Seeding initial Gida Threads clothing catalog...');
        const initialProducts = [
          {
            name: "GIDA \"Star\" Distressed Heavyweight Tee",
            slug: "gida-star-distressed-tee",
            category: "tees",
            price: 88.00,
            original_price: 115.00,
            description: "Hand-distressed vintage buttercream heavyweight cotton tee with signature cut-out chest accent. Embellished with the iconic G†DA star/cross typography, 'glide through' atelier micro-print, raw hand-frayed distressed hem, and distressed collar.",
            details: JSON.stringify([
              "280 GSM vintage-washed combed jersey cotton",
              "Custom hand-distressed raw frayed hemline and neckline",
              "Signature cut-out chest ventilation accent with 'glide through' print",
              "Dense black matte G†DA star emblem screen print",
              "Preshrunk relaxed boxy drape"
            ]),
            sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
            colors: JSON.stringify([
              { name: "Buttercream Yellow", hex: "#f3e7c4", image_url: "/images/gida_distressed_tee.png" },
              { name: "Vintage Chalk", hex: "#e5dfd5", image_url: "/images/gida_distressed_tee_chalk.png" },
              { name: "Washed Black", hex: "#18191c", image_url: "/images/gida_distressed_tee_black.png" },
              { name: "Crimson Red", hex: "#991b1b", image_url: "/images/gida_distressed_tee_red.png" },
              { name: "Army Olive", hex: "#3f4d36", image_url: "/images/gida_distressed_tee_olive.png" }
            ]),
            in_stock: 1,
            stock_quantity: 24,
            image_url: "/images/gida_distressed_tee.png",
            back_image_url: null,
            badge: "Signature Star Drop",
            rating: 4.97,
            reviews_count: 128
          },
          {
            name: "GIDA Abstract Contour Wireframe Tee",
            slug: "gida-abstract-contour-wireframe-tee",
            category: "tees",
            price: 82.00,
            original_price: 105.00,
            description: "Oversized luxury heavyweight black tee featuring Gida's continuous-contour geometric wireframe artwork in electric cyan, coral orange, and chalk white, finished with the teal GIDA atelier signature.",
            details: JSON.stringify([
              "260 GSM single jersey ultra-dense combed cotton",
              "Multi-pass architectural contour print in cyan, coral, and white",
              "Teal GIDA typography signature on lower chest",
              "Ribbed high-collar crew neck that maintains structure",
              "Oversized boxy cut designed in Paris atelier"
            ]),
            sizes: JSON.stringify(["S", "M", "L", "XL"]),
            colors: JSON.stringify([
              { name: "Onyx Black", hex: "#111215", image_url: "/images/gida_abstract_tee.png" },
              { name: "Deep Navy", hex: "#151c2e", image_url: "/images/gida_abstract_tee_navy.png" },
              { name: "Charcoal Slate", hex: "#252930", image_url: "/images/gida_abstract_tee_charcoal.png" },
              { name: "Optic White", hex: "#f0f2f5", image_url: "/images/gida_abstract_tee_white.png" }
            ]),
            in_stock: 1,
            stock_quantity: 35,
            image_url: "/images/gida_abstract_tee.png",
            back_image_url: null,
            badge: "New Release",
            rating: 4.92,
            reviews_count: 89
          },
          {
            name: "\"2% Low Battery // I Told ChatGPT\" Heavyweight Hoodie",
            slug: "low-battery-chatgpt-heavyweight-hoodie",
            category: "hoodies",
            price: 165.00,
            original_price: 195.00,
            description: "Iconic double-sided statement piece. The front features the minimalist embroidered '2%' low battery status glyph on the chest, while the back commands attention with bold architectural typography: 'I TOLD CHATGPT ABOUT U'. Crafted from ultra-dense 480 GSM French Terry organic cotton fleece with structured double-lined hood and drop-shoulder boxy drape.",
            details: JSON.stringify([
              "Front View: Minimalist precision embroidered '2%' low battery status indicator on chest",
              "Back View: Iconic bold white architectural typographic statement: 'I TOLD CHATGPT ABOUT U'",
              "480 GSM custom-milled heavyweight organic French Terry fleece",
              "Architectural double-layer hood structured to hold posture without drawstrings",
              "Double-needle reinforced construction across all stress points",
              "Preshrunk vintage garment enzyme wash for everlasting hand-feel and drape"
            ]),
            sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
            colors: JSON.stringify([
              {
                name: "Jet Black",
                hex: "#0b0c0e",
                image_url: "/images/lowbattery_hoodie.png",
                back_image_url: "/images/chatgpt_hoodie.png"
              },
              {
                name: "Heather Grey",
                hex: "#4b5563",
                image_url: "/images/lowbattery_hoodie_grey.png",
                back_image_url: "/images/chatgpt_hoodie_slate.png"
              },
              {
                name: "Dark Olive",
                hex: "#333d29",
                image_url: "/images/lowbattery_hoodie_olive.png",
                back_image_url: "/images/chatgpt_hoodie_green.png"
              },
              {
                name: "Deep Navy",
                hex: "#141d2b",
                image_url: "/images/lowbattery_hoodie_navy.png",
                back_image_url: "/images/chatgpt_hoodie_blue.png"
              },
              {
                name: "Crimson Red",
                hex: "#7f1d1d",
                image_url: "/images/lowbattery_hoodie_crimson.png",
                back_image_url: "/images/chatgpt_hoodie_burgundy.png"
              }
            ]),
            in_stock: 1,
            stock_quantity: 28,
            image_url: "/images/lowbattery_hoodie.png",
            back_image_url: "/images/chatgpt_hoodie.png",
            badge: "Dual-Sided Statement",
            rating: 4.98,
            reviews_count: 248
          },
          {
            name: "GIDA \"Afro Muse\" Heavyweight Muscle Tee",
            slug: "gida-afro-muse-muscle-tee",
            category: "tees",
            price: 78.00,
            original_price: 98.00,
            description: "Handcrafted vintage-washed charcoal heavyweight sleeveless muscle tee. Front showcases the iconic Afro Muse watercolor portrait in electric cyan, magenta, and amber tones with the signature 'gida threads' atelier print. Back features the inspirational Nigerian dream-chasing manifesto and geometric matrix glyphs.",
            details: JSON.stringify([
              "Front: High-density screen printed Afro Muse watercolor silhouette & gida threads typography",
              "Back: Authentic dream-chasing manifesto typographic print & geometric matrix runes",
              "280 GSM vintage enzyme-washed combed cotton jersey",
              "Raw cut-off sleeveless armholes with reinforced stay-stitching",
              "Structured ribbed crew collar that holds form"
            ]),
            sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
            colors: JSON.stringify([
              {
                name: "Vintage Charcoal",
                hex: "#222326",
                image_url: "/images/afro_muse_tank_front.png",
                back_image_url: "/images/afro_muse_tank_back.png"
              },
              {
                name: "Washed Black",
                hex: "#141517",
                image_url: "/images/afro_muse_tank_front_black.png",
                back_image_url: "/images/afro_muse_tank_back_black.png"
              },
              {
                name: "Vintage Chalk",
                hex: "#d8d6ce",
                image_url: "/images/afro_muse_tank_front_chalk.png",
                back_image_url: "/images/afro_muse_tank_back_chalk.png"
              }
            ]),
            in_stock: 1,
            stock_quantity: 26,
            image_url: "/images/afro_muse_tank_front.png",
            back_image_url: "/images/afro_muse_tank_back.png",
            badge: "Heritage Muse Drop",
            rating: 4.96,
            reviews_count: 142
          },
          {
            name: "GIDA \"Chasing Dreams\" Graphic Long-Sleeve Tee",
            slug: "gida-chasing-dreams-long-sleeve",
            category: "tees",
            price: 92.00,
            original_price: 120.00,
            description: "Heavyweight drop-shoulder long-sleeve tee in pure jet black. Front features the iconic Gida Threads bold typographic logo across the chest. Back delivers an electric visual statement featuring royal blue typographic block, red geometric matrix runes, and the full Nigerian dream-chasing manifesto text.",
            details: JSON.stringify([
              "Front: Thick matte puff-printed 'Gida threads' chest statement typography",
              "Back: Multi-color silkscreen with royal blue typographic box, neon red matrix grid, and dream manifesto",
              "300 GSM ultra-heavyweight combed organic cotton",
              "Durable 2x2 ribbed wrist cuffs and reinforced double-needle hem",
              "Relaxed boxy silhouette engineered for streetwear layering"
            ]),
            sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
            colors: JSON.stringify([
              {
                name: "Jet Black",
                hex: "#0b0c0e",
                image_url: "/images/chasing_dreams_ls_front.png",
                back_image_url: "/images/chasing_dreams_ls_back.png"
              },
              {
                name: "Deep Navy",
                hex: "#141d2b",
                image_url: "/images/chasing_dreams_ls_front_navy.png",
                back_image_url: "/images/chasing_dreams_ls_back_navy.png"
              },
              {
                name: "Heather Slate",
                hex: "#374151",
                image_url: "/images/chasing_dreams_ls_front_slate.png",
                back_image_url: "/images/chasing_dreams_ls_back_slate.png"
              }
            ]),
            in_stock: 1,
            stock_quantity: 30,
            image_url: "/images/chasing_dreams_ls_front.png",
            back_image_url: "/images/chasing_dreams_ls_back.png",
            badge: "Cyber-Manifesto Drop",
            rating: 4.97,
            reviews_count: 168
          },
          {
            name: "GIDA \"Archive Bear\" Long-Sleeve Tee",
            slug: "gida-archive-bear-long-sleeve",
            category: "tees",
            price: 86.00,
            original_price: 110.00,
            description: "High-fashion streetwear long-sleeve in optic chalk white. Features the signature Gida Teddy Bear mascot screen-printed in shaded warm slate and burnt umber, underscored with the iconic brushed-script 'Gida Threads' typographic insignia.",
            details: JSON.stringify([
              "Front: High-definition screen-printed Gida Teddy Bear mascot with brushed script logo",
              "280 GSM premium single jersey combed ringspun cotton",
              "Structured ribbed crew neck with ribbed cuffs",
              "Enzyme pre-washed for velvety soft hand feel with zero shrinkage",
              "Tailored streetwear drape designed in Paris atelier"
            ]),
            sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
            colors: JSON.stringify([
              {
                name: "Optic White",
                hex: "#ffffff",
                image_url: "/images/teddy_bear_ls_front.png",
                back_image_url: null
              },
              {
                name: "Heather Grey",
                hex: "#9ca3af",
                image_url: "/images/teddy_bear_ls_front_grey.png",
                back_image_url: null
              },
              {
                name: "Washed Black",
                hex: "#18191c",
                image_url: "/images/teddy_bear_ls_front_black.png",
                back_image_url: null
              }
            ]),
            in_stock: 1,
            stock_quantity: 22,
            image_url: "/images/teddy_bear_ls_front.png",
            back_image_url: null,
            badge: "Atelier Mascot",
            rating: 4.94,
            reviews_count: 94
          }
        ];

        const stmt = db.prepare(`
          INSERT INTO products (name, slug, category, price, original_price, description, details, sizes, colors, in_stock, stock_quantity, image_url, back_image_url, badge, rating, reviews_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        initialProducts.forEach(p => {
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
            p.back_image_url,
            p.badge,
            p.rating,
            p.reviews_count
          );
        });

        stmt.finalize(() => {
          console.log('Database successfully seeded with Gida Threads catalog!');
        });

        // Seed a sample past order for immediate admin dashboard preview
        db.run(`
          INSERT OR IGNORE INTO orders (id, customer_name, customer_email, shipping_address, city, postal_code, country, total_amount, discount_amount, currency, payment_method, status, items_json)
          VALUES (
            'GID-884210',
            'Alexander Vance',
            'alexander.vance@example.com',
            '742 Evergreen Terrace, Suite 4B',
            'New York',
            '10001',
            'United States',
            405.00,
            45.00,
            'USD',
            'Apple Pay',
            'Processing',
            '[{"id":1,"name":"Obsidian Heavyweight Hoodie","price":145,"quantity":1,"size":"L","color":"Obsidian Black"},{"name":"Tactical Stealth MA-1 Bomber","price":260,"quantity":1,"size":"L","color":"Stealth Black"}]'
          )
        `);
      }
    });
  });
}

initDb();

module.exports = db;
