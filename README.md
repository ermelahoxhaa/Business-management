# Business Management

A full-stack business management application with role-based access and employee workflows.

## Overview

This repository contains two main applications:

- `backend/` - Express.js + Sequelize API server
- `frontend/` - React + Vite frontend application

The app supports user authentication, employee management, project and task tracking, departments, and comments.

## Features

- Role-based routes for `admin`, `team_leader`, and `employee`
- Employee dashboard with task status updates and project health overview
- Admin/team leader dashboard with employee, client, project, task, and department management
- PostgreSQL support via environment variables
- Authentication with JWT tokens

## Repository Structure

- `backend/`
  - `src/app.js` - Express app setup and route registration
  - `server.js` - server startup, database sync, seed data creation
  - `src/config/database.js` - Sequelize database configuration
  - `src/controllers/` - request controllers
  - `src/services/` - business logic services
  - `src/repositories/` - database repository layer
  - `src/models/` - Sequelize models
  - `src/routes/` - API route definitions

- `frontend/`
  - `src/App.jsx` - React router and protected route handling
  - `src/pages/` - application pages, including employee and dashboard views
  - `src/services/` - API client and auth helpers
  - `src/components/` - shared UI components

## Prerequisites

- Node.js 18+ or compatible
- npm
- PostgreSQL database (recommended)

## Backend Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file with values like:

```env
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=12345678
DB_HOST=localhost
PORT=5000
MONGO_URI=mongodb://localhost:27017/businessdb
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
TEAM_LEADER_EMAIL=team-leader@example.com
TEAM_LEADER_PASSWORD=teamleader123
EMPLOYEE_EMAIL=employee@example.com
EMPLOYEE_PASSWORD=employee123
```

3. Start the backend server:

```bash
npm start
```

The backend listens on port `5000` by default.

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the frontend in development mode:

```bash
npm run dev
```

The frontend uses Vite and typically runs on `http://localhost:5173`.

## Notes

- The backend currently uses PostgreSQL from `.env` if configured, with SQLite as an optional fallback.
- The application seeds default admin, team leader, and employee users on startup when configured values are present.
- Protected routes determine the default redirect path based on the authenticated role.

## Useful Commands

- Backend development: `cd backend && npm run dev`
- Frontend development: `cd frontend && npm run dev`
- Frontend production build: `cd frontend && npm run build`

## Contact

Update this README with your deployment instructions, API docs, or team-specific setup details as needed.
