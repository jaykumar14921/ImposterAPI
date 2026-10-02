# 🧪 ImposterAPI

A **free, open fake REST API** for grocery products — think of it as a grocery-flavored [Fake Store API](https://fakestoreapi.com). Built with **Express 5** and **MongoDB Atlas**, it's perfect for prototyping e-commerce frontends, testing pagination/filtering logic, or demoing apps without building a backend first.

🌐 **Live demo:** `https://imposterapi-5.onrender.com` &nbsp;·&nbsp; 📖 **Interactive docs:** `https://imposterapi-5.onrender.com/docs`

![Express](https://img.shields.io/badge/Express-5-black?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB%20Atlas-6.15-47a248?logo=mongodb&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-enabled-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## ✨ Features

- 🛒 **Realistic grocery catalog** — products with title, unit, type, price (₹), image, description, FSSAI license, country of origin, and shelf life
- 🗂️ **Category taxonomy** — 7 categories (`fruit_veges`, `atta_rice`, `dairy_breakfast`, `drinks`, `oil_masala`, `personal_care`, `instant_food`) with sub-categories
- 🔎 **Flexible querying** — fetch all, single by ID, by category, by category + sub-category, or paginated with `page` / `limit`
- ✍️ **Full CRUD** — create, read, update (`PUT`/`PATCH`), and delete products
- 🌐 **CORS-enabled** — call it straight from the browser, no API key needed
- 📖 **Built-in docs page** served at `/docs`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- A MongoDB Atlas cluster (or any MongoDB instance)

### Installation

```bash
git clone https://github.com/jaykumar14921/ImposterAPI.git
cd ImposterAPI
npm install
```

Create a `.env` file:

```bash
MONGODBatlas_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
PORT=3000   # optional, defaults to 3000
```

### Run

```bash
npm start      # node app.js
npm run dev    # node --watch app.js  (auto-restart on change)
```

> ⚠️ The server connects to the database at startup — if `MONGODBatlas_URL` is missing it will crash with a MongoDB connection error.

---

## 🌐 API Reference

Base URL (local): `http://localhost:3000` · (live): `https://imposterapi-5.onrender.com`

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/data` | Get **all** products (plain JSON array) |
| `GET` | `/data/limit?page=1&limit=28&category=dairy_breakfast` | Paginated products. Returns `{ data, total, page, totalPages }` |
| `GET` | `/data/:id` | Get a single product by integer ID (`400` for non-numeric, `404` if not found) |
| `GET` | `/data/category/:category` | All products in a category |
| `GET` | `/data/category/:category/sub-category/:subcategory` | Products filtered by category **and** sub-category |
| `POST` | `/data` | Insert a new product (JSON body) → `201` |
| `PUT` | `/data/:id` | Update a product — body `id` must match the URL `id` |
| `PATCH` | `/data/:id` | Partial update (same behavior as `PUT` — both use `$set`) |
| `DELETE` | `/data/:id` | Delete a product by ID |

### Meta

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | List of distinct categories |
| `GET` | `/api/sub-categories` | List of distinct sub-categories |
| `GET` | `/` | Landing page (`public/index.html`) |
| `GET` | `/docs` | Documentation page (`public/docs.html`) |

### Examples

```bash
# All products
curl https://imposterapi-5.onrender.com/data

# Paginated + category filter
curl "https://imposterapi-5.onrender.com/data/limit?page=2&limit=10&category=fruit_veges"

# Single product
curl https://imposterapi-5.onrender.com/data/1

# Create a product
curl -X POST https://imposterapi-5.onrender.com/data \
  -H "Content-Type: application/json" \
  -d '{
    "id": 777,
    "title": "Bonn Bombay Pav (12 slices)",
    "unit": "350g (12 pieces)",
    "type": "Pav",
    "price": 55,
    "image": "https://example.com/pav.webp",
    "description": "Soft pav buns, perfect for vada pav.",
    "categories": { "category": "dairy_breakfast", "sub-category": "bread" },
    "fssaiLicense": "10019064001813",
    "countryOfOrigin": "India",
    "shelfLife": "6 Days"
  }'
```

### Product schema

| Field | Type | Example |
|-------|------|---------|
| `id` | integer | `1` |
| `title` | string | `"Amul Taaza Toned Milk"` |
| `unit` | string | `"500 ml"` |
| `type` | string | `"Milk"` |
| `price` | number | `28` |
| `image` | string (URL) | S3 image URL |
| `description` | string | product description |
| `categories.category` | string | `dairy_breakfast` |
| `categories.sub-category` | string | `milk` |
| `fssaiLicense` | string | `"10019064001813"` |
| `countryOfOrigin` | string | `"India"` |
| `shelfLife` | string | `"6 Days"` |

---

## 🏗️ How It Works

```
Browser / any HTTP client
        │
        ▼  (CORS open, no auth)
┌───────────────────────────────────┐
│  Express 5  (app.js)              │
│  ├─ express.static → public/      │
│  ├─ GET /docs → docs.html         │
│  └─ REST routes → MongoDB queries │
└───────────┬───────────────────────┘
            │ MongoDB Node.js driver v6
            ▼
   MongoDB Atlas · db: Project1 · collection: FakeAPI
```

The app wraps the whole server in an async `main()` that connects to MongoDB Atlas first, then registers routes that query the `FakeAPI` collection in the `Project1` database.

---

## 📂 Project Structure

```
ImposterAPI/
├── app.js            # Express server + all routes + MongoDB connection
├── package.json      # "start": "node app.js" · "dev": "node --watch app.js"
├── public/
│   ├── index.html    # landing page
│   ├── docs.html     # interactive API docs (served at /docs)
│   └── assets/       # images
└── .gitignore
```

---

## 🛣️ Roadmap / Known Limitations

- [ ] **No authentication** — anyone can read *and write*. It's a fake/test API; don't store anything sensitive.
- [ ] **`PUT` and `PATCH` behave identically** — both merge fields with `$set`; `PUT` is not a full-document replace.
- [ ] **The MongoDB client is never closed** and there's no graceful shutdown handler (`SIGTERM`/`SIGINT`) — the `finally` block in `main()` is empty.
- [ ] **No `.env.example`** — the expected variable name (`MONGODBatlas_URL`) must be discovered from `app.js`.
- [ ] The hosted `/docs` page shows a few example paths that don't match the real routes (`/api/data/1` vs the actual `/data/1`) — the table above is authoritative.
- [ ] Unused imports (`fs.link`) and an accidental `{` file in the repo root could use a cleanup pass.
- [ ] `bootstrap`/`jquery` are npm dependencies but only CDN links are used — they can be removed.

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

## 📄 License

ISC (see `package.json`).

---

Built with Express, MongoDB Atlas & Bootstrap. Free to use for demos, learning, and prototyping. 🎉
