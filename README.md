<div align="center">

# 🚚 TransitOps
**Next-Generation Transport Operations & Fleet Management**

TransitOps is an end-to-end operational control center designed for modern transport fleets. It provides real-time telemetry, dynamic dispatch, maintenance tracking, and actionable analytics to maximize fleet efficiency and safety.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>
</div>

---

## 🛠️ Built With

<div align="center">
  <img src="https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
</div>

---

## ✨ Key Features

- **📊 Central Command Dashboard:** Get a holistic view of your operations, including fleet health, active trips, and key performance indicators.
- **📍 Live Telemetry & Tracking:** Monitor driver and vehicle statuses in real-time, powered by robust Socket.io connections.
- **🛣️ Intelligent Dispatch & Routing:** Seamlessly assign drivers, coordinate complex trips, and log end-to-end historical data.
- **🔧 Preventative Maintenance:** Streamline workshop workflows by tracking service logs, managing repairs, and avoiding unexpected breakdowns.
- **🔐 Enterprise-Grade RBAC:** Ensure data security with strict Role-Based Access Control, tailored for drivers, managers, and admins.
- **📄 Automated Analytics:** Generate actionable insights and PDF reports on-demand to continuously optimize your fleet performance.

---

## 📸 Platform Previews

<table>
  <tr>
    <td width="50%" align="center">
      <b>1. Secure Login & Access Control</b><br/>
      <img src="screenshots/01-login.png" alt="Login Page" width="100%">
    </td>
    <td width="50%" align="center">
      <b>2. Central Command Dashboard</b><br/>
      <img src="screenshots/02-dashboard.png" alt="Dashboard" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>3. Real-Time Fleet Status</b><br/>
      <img src="screenshots/03-fleet.png" alt="Fleet" width="100%">
    </td>
    <td width="50%" align="center">
      <b>4. Driver Personnel Management</b><br/>
      <img src="screenshots/04-drivers.png" alt="Drivers" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>5. Active Trips & Dispatching</b><br/>
      <img src="screenshots/05-trips.png" alt="Trips" width="100%">
    </td>
    <td width="50%" align="center">
      <b>6. Workshop & Maintenance Operations</b><br/>
      <img src="screenshots/06-maintenance.png" alt="Maintenance" width="100%">
    </td>
  </tr>
  <tr>
    <td width="100%" colspan="2" align="center">
      <b>7. Performance Analytics & Insights</b><br/>
      <img src="screenshots/08-analytics.png" alt="Analytics" width="70%">
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

Follow these steps to set up TransitOps locally for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (v15+)

### 1. Database & Backend Setup

First, navigate to the `backend` directory, install dependencies, and configure the environment:

```bash
cd backend
npm install
cp .env.example .env
```
*(For Windows PowerShell, use `Copy-Item .env.example .env`)*

Update your `backend/.env` file with proper PostgreSQL credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/transitops"
PORT=5000
NODE_ENV=development
JWT_SECRET="your_super_secret_key"
```

Initialize the database schema and populate it with sample data:
```bash
npm run db:deploy
npm run db:seed
```

### 2. Run the API Server

Start the backend application in development mode:
```bash
npm run dev
```
> **Note:** The API will listen for requests at `http://localhost:5000`

### 3. Run the Frontend Application

Open a new terminal session, navigate to the `frontend` folder, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```
> **Note:** The web interface is accessible at `http://localhost:5173`

---

## 🗄️ CLI Commands Reference

Available commands within the `backend/` directory:

| Command | Action |
|---|---|
| `npm run db:migrate` | Generate a migration file after modifying `schema.prisma` |
| `npm run db:deploy`  | Apply all pending migrations directly to the database |
| `npm run db:seed`    | Seed the database with initial demo configurations |
| `npm run db:reset`   | Completely drop, recreate, migrate, and re-seed the DB |
| `npm run db:studio`  | Launch Prisma Studio (visual database UI) at `localhost:5555` |
| `npm run prisma:generate` | Update the Prisma Client following schema updates |

---

## 👥 Contributors

- **Nigam Vaghani**
- **Dhanesh Vaghasiya**
- **Rohit Sharma**

---

<div align="center">
  <i>Proudly engineered for the 2026 Odoo Hackathon.</i>
</div>
