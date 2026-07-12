<div align="center">

# 🚚 TransitOps
**Smart Transport Operations Platform**

An end-to-end operational control center for modern transport fleets, featuring real-time telemetry, dynamic routing, and safety compliance.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>
</div>

---

## 🛠️ Built With

### Frontend Technologies
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Recharts](https://img.shields.io/badge/recharts-%2322B5BF.svg?style=for-the-badge)

### Backend Technologies
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma ORM](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![JWT Authentication](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

---

## ✨ Key Features

- **📊 Centralized Dashboard:** Overview of KPIs, fleet utilization, operational costs, and ROI.
- **📍 Real-Time Telemetry:** Live driver/vehicle locations and status powered by Socket.io.
- **🛣️ Dynamic Routing & Trips:** Assign drivers, track trips from source to destination, and log trip histories.
- **💰 Financial Operations:** Complete logging and tracking for vehicle fuel entries and operational expenses.
- **🔧 Maintenance Workflow:** Track service logs, maintenance costs, and active workshop status to calculate fleet health.
- **🔐 Secure RBAC:** Role-Based Access Control enforcing secure routing and API access for different staff levels.
- **📄 Automated Reports:** Generate and download PDF analytics reports via PDFKit.

---

## 📸 Platform Previews

<details open>
<summary><b>1. Secure Login & RBAC</b></summary>
<img src="screenshots/01-login.png" alt="Login Page" width="100%">
</details>

<details open>
<summary><b>2. Central Command Dashboard</b></summary>
<img src="screenshots/02-dashboard.png" alt="Dashboard" width="100%">
</details>

<details>
<summary><b>3. Fleet Status</b></summary>
<img src="screenshots/03-fleet.png" alt="Fleet" width="100%">
</details>

<details>
<summary><b>4. Driver Personnel</b></summary>
<img src="screenshots/04-drivers.png" alt="Drivers" width="100%">
</details>

<details>
<summary><b>5. Active Trips & Dispatch</b></summary>
<img src="screenshots/05-trips.png" alt="Trips" width="100%">
</details>

<details>
<summary><b>6. Workshop & Maintenance</b></summary>
<img src="screenshots/06-maintenance.png" alt="Maintenance" width="100%">
</details>

<details>
<summary><b>7. Financials & Fuel Log</b></summary>
<img src="screenshots/07-fuel.png" alt="Fuel" width="100%">
</details>

<details>
<summary><b>8. Performance Analytics</b></summary>
<img src="screenshots/08-analytics.png" alt="Analytics" width="100%">
</details>



---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v15 or higher)

### 1. Database Setup

First, install backend dependencies and set up your environment:

```bash
cd backend
npm install
cp .env.example .env
```
*(On Windows PowerShell, use `Copy-Item .env.example .env`)*

Configure your `backend/.env` file with your database credentials:
```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/transitops"
PORT=5000
NODE_ENV=development
JWT_SECRET="your_secret_key"
```

Apply migrations and seed the database with initial demo data:
```bash
npm run db:deploy
npm run db:seed
```

### 2. Start the Backend

```bash
npm run dev
```
> The API will be available at `http://localhost:5000`

### 3. Start the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
> The frontend application will be available at `http://localhost:5173`

---

## 🗄️ Database Commands Reference

Run these from within the `backend/` directory:

| Command | Description |
|---|---|
| `npm run db:migrate` | Create a new migration after editing `schema.prisma` |
| `npm run db:deploy`  | Apply committed migrations (ideal for fresh setups) |
| `npm run db:seed`    | Insert demo seed data into the database |
| `npm run db:reset`   | Drop, recreate, migrate, and seed the local database |
| `npm run db:studio`  | Open Prisma Studio (visual DB browser) at `localhost:5555` |
| `npm run prisma:generate` | Regenerate Prisma Client after schema changes |

---

<div align="center">
  <i>Developed for the 2026 Odoo Hackathon</i>
</div>
