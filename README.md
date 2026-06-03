# Business Management System

Web application for tasks, projects, employees, departments, clients and invoices.

## Prerequisites

Before you start, install:

- [Node.js](https://nodejs.org/) (v18 or newer)
- npm (comes with Node.js)
- PostgreSQL
- MongoDB

Create a PostgreSQL database (example name: `business_db`):

```sql
CREATE DATABASE business_db;
```

---

## Installation

### Backend

1. Open a terminal in the project folder and go to the backend:

```bash
cd backend
npm install
```

### Frontend

2. In another terminal (or after backend install):

```bash
cd frontend
npm install
```

---

## Configuration

In the `backend` folder, create a file named **`.env`** with your settings:

```env
PORT=5000

DB_NAME=business_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost

MONGO_URI=mongodb://127.0.0.1:27017/business_db

JWT_SECRET=your_secret_key_here
```

Replace `your_postgres_password` and `your_secret_key_here` with your own values.  

The frontend connects to the API at `http://localhost:5000` (set in `frontend/src/services/api.js`).

---

## Running the project

### 1. Start the backend

```bash
cd backend
npm run dev
```

Wait until you see:

- `PostgreSQL connected`
- `MongoDB connected`
- `Server running on port 5000`

The database tables are created on startup. Team Leader and employee test users are created automatically.

### 2. Start the frontend

```bash
cd frontend
npm run dev
```

Open the address from the terminal (usually **http://localhost:5173**).

### 3. Log in

| Role | Email | Password |
|------|-------|----------|
| Team leader | team-leader@example.com | teamleader123 |
| Employee | employee@example.com | employee123 |

For admin, use an account that already has the `admin` role in the database.


## If something fails

- Database error → check PostgreSQL is running and `.env` password is correct
- Port 5000 in use → stop the old backend process
- MongoDB message → install MongoDB or start the `MongoDB` service on Windows
