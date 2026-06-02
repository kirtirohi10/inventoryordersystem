# StockVibe - Inventory & Order Management System

StockVibe is a production-ready, premium full-stack **Inventory & Order Management System** featuring real-time stock validations, automated database transactions, and a dark-glassmorphic responsive dashboard interface.

---

## 🚀 Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React.js (Vite, Axios, React Router, Lucide Icons, Custom Vanilla CSS)
- **Database**: PostgreSQL (SQLAlchemy ORM, Pydantic data schemas)
- **Containerization**: Docker & Docker Compose
- **Hosting Target**: Neon PostgreSQL (DB), Render (Backend API), Vercel (Frontend UI)

---

## 📂 Project Structure

```text
inventory-order-system/
├── docker-compose.yml       # Docker container definitions
├── README.md                # General documentation
├── DEPLOYMENT.md            # Step-by-step cloud deployment guidelines
├── backend/
│   ├── app/
│   │   ├── api/             # API Router endpoints
│   │   ├── core/            # Database engine and config files
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── schemas/         # Pydantic data validators
│   │   ├── services/        # Atomic Business logic and transactions
│   │   └── main.py          # FastAPI application entrypoint
│   ├── Dockerfile
│   ├── requirements.txt     # Python packages index
│   └── .env                 # Local variables
└── frontend/
    ├── src/
    │   ├── components/      # Glassmorphic UI layout panels and modals
    │   ├── pages/           # Interactive CRUD templates and dashboards
    │   ├── services/        # Axios API client handlers
    │   ├── styles/          # Custom CSS design files (Variables, Glass, Animations)
    │   ├── App.jsx          # Route definitions
    │   └── main.jsx         # DOM Mounting script
    ├── index.html
    ├── package.json
    ├── vite.config.js       # Vite build configurations
    ├── Dockerfile
    └── .env                 # Local variables
```

---

## 🛠️ Local Startup (Using Docker Compose)

Before running the command, ensure you have **Docker Desktop** installed and running on your system.

To build and launch the database, API server, and web dashboard:

1. Clone or copy the folder contents.
2. Navigate to the root directory `inventory-order-system/`.
3. Start the application:
   ```bash
   docker-compose up --build
   ```

4. Once the build finishes and services report healthy:
   - **Frontend Dashboard**: Navigate to [http://localhost:5173](http://localhost:5173) in your browser.
   - **Backend API Docs (Swagger)**: Explore endpoints at [http://localhost:8000/docs](http://localhost:8000/docs).
   - **API Health Endpoint**: Check status at [http://localhost:8000/health](http://localhost:8000/health).

---

## 👨‍💻 Manual Local Running (Without Docker)

### 1. Database Configuration
Ensure a local **PostgreSQL** server is running and create a database named `inventory_db`. 

Update the database credentials in `backend/.env`.

### 2. Backend Startup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Launch the dev server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 3. Frontend Startup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch Vite server:
   ```bash
   npm run dev
   ```
4. Access the site at `http://localhost:5173`.

---

## 📦 Database Entity Details

- **Products Table**: Holds name, unique SKU indexes, price, and current stock level constraints.
- **Customers Table**: Maintains client names, unique emails, and phone indices.
- **Orders Table**: Links an order to a specific customer.
- **Order Items Table**: Captures snapshots of item quantity, historical unit prices, and references to order/product records.

**Business Logic Rule Enforcement**: When ordering, the transaction block performs a `select ... for update` lock on product quantities, validating that requested stock is available. If all checks pass, it automatically decrements stock levels and commits; otherwise, the transaction is immediately rolled back and throws a meaningful HTTP 400 Bad Request error.
