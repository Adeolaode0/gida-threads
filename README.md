# GIDA THREADS — Cloud E-Commerce Platform & Infrastructure

Full-stack luxury streetwear e-commerce platform with a modern dark editorial storefront, persistent SQLite database with Express REST API, administrative inventory & order operations portal, and production-grade AWS cloud infrastructure (Terraform + Docker).

---

## Architecture Overview

```
Gida threads cloud infrastructure/
├── backend/
│   ├── db.js             # SQLite database schema, tables, and automated catalog seeder
│   ├── server.js         # Express 5 REST API + static storefront server
│   ├── gida_store.db     # Persistent SQLite database file
│   └── package.json      # Backend dependencies (express, cors, sqlite3)
├── frontend/
│   ├── index.html        # Semantic HTML5 storefront & administrative modals
│   ├── styles.css        # Luxury dark streetwear design system (Syne + Outfit)
│   ├── app.js            # Reactive store controller, cart, currency converter, checkout wizard
│   └── images/           # High-resolution AI-generated product photography
│       ├── hoodie.jpg    # Obsidian Heavyweight Hoodie (480 GSM)
│       ├── tee.jpg       # Vintage Acid-Wash Graphic Tee
│       ├── bomber.jpg    # Tactical Stealth MA-1 Bomber
│       ├── cargo.jpg     # Modular Tactical Cargo Trousers
│       └── cap.jpg       # Embroidered Archive Dad Cap
├── terraform/            # AWS Cloud Infrastructure as Code
│   ├── main.tf           # AWS VPC, Subnets, ALB, ECS Fargate, S3 Bucket
│   ├── variables.tf      # Deployment variables & region config
│   └── outputs.tf        # Cloud endpoints & resource ARNs
├── Dockerfile            # Multi-stage production container
├── docker-compose.yml    # Single-command container runtime
└── README.md
```

---

## Quick Start (Run Locally)

The server serves both the REST API and the storefront on port **5000**:

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Run the server
node server.js
```

Open your browser to:
**`http://localhost:5000`**

---

## Features & Capabilities

### 1. Storefront Experience
- **Editorial Dark Luxury Aesthetics**: Rich obsidian background, gold/amber accents (`#e5b869`), glassmorphic overlays (`backdrop-filter: blur(16px)`), and micro-animations.
- **Dynamic Catalog**: Filter by category (`Hoodies`, `Graphic Tees`, `Outerwear`, `Cargo Pants`, `Accessories`), real-time search, "In Stock Only" toggle, and multi-parameter sorting.
- **Real-Time Currency Switching**: Live conversion across **USD ($)**, **EUR (€)**, and **GBP (£)**.
- **Product Detail / Quick View**: Image zoom preview, size matrix selector (`S`, `M`, `L`, `XL`, `XXL`), color swatches, stock availability, and specs accordion.
- **Slide-out Cart Bag**: Real-time line item updates, quantity increment/decrement, free shipping progress bar ($120 threshold), and VIP discount coupon validation (`GIDA10` gives 10% off).

### 2. Multi-Step Checkout & Simulated Payment
- **Step 1**: Shipping destination details with validation.
- **Step 2**: Card / Apple Pay / Google Pay simulation with interactive visual card preview.
- **Step 3**: Instant order confirmation with generated reference code (e.g. `GID-849201`), receipt breakdown, inventory reservation in SQLite, and printable invoice.

### 3. Backstage Store Operations & Admin Portal
- Accessible anytime via the **`Admin & Ops`** pill button in the top navigation bar.
- **Live Analytics**: Real-time gross revenue, order volume, catalog size, and low stock alerts.
- **Inventory Manager**: In-line editing of product retail prices and stock levels directly persisted to SQLite.
- **Live Orders Stream**: View incoming orders, items, totals, and update statuses (`Confirmed` → `Processing` → `Shipped` → `Delivered`).
- **+ New Drop Form**: Add new pieces directly to the active database.

---

## AWS Cloud Deployment

Deploy the entire infrastructure using Terraform and Docker:

### 1. Build and Push Container
```bash
# Build Docker image
docker build -t gida-threads:latest .

# Run locally with Docker Compose
docker-compose up -d
```

### 2. Deploy AWS Infrastructure via Terraform
```bash
cd terraform

# Initialize AWS provider
terraform init

# Review execution plan
terraform plan

# Apply infrastructure (creates VPC, ALB, ECS Fargate, S3 bucket)
terraform apply
```
