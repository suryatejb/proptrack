# PropTrack — Real Estate Listing & Transaction Management System

Full-stack web application.  
Connects to a MySQL 8 database hosted on the class server.

---

## Prerequisites

- Node.js v18 or later
- npm
- Access to the class MySQL server (167.71.90.83)

---

## Project Structure

```
proptrack/
  client/       React frontend (Vite)
  server/       Node.js/Express REST API
  sql/          schema.sql — full schema, seed data, views, stored procedure
```

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd proptrack
```

### 2. Configure the database connection

Create a `.env` file inside the `server/` folder:

```
DB_HOST=167.71.90.83
DB_USER=sub151
DB_PASS=your_password_here
DB_NAME=sub151
DB_PORT=3306
```

> The `.env` file is not committed to source control. You'll need to create it manually.

### 3. Install server dependencies

```bash
cd server
npm install
```

### 4. Install client dependencies

```bash
cd ../client
npm install
```

---

## Running the App

### Start the API server

```bash
cd server
node index.js
```

The server runs on **http://localhost:5000**.

### Start the frontend (in a separate terminal)

```bash
cd client
npm run dev
```

The frontend runs on **http://localhost:3000**. Open that URL in your browser.

---

## Database

The full schema (tables, indexes, views, stored procedure, and seed data) is in `sql/schema.sql`.

To (re)import it into MySQL:
1. Log in to phpMyAdmin at the class server
2. Select the `sub151` database
3. Go to Import, choose `sql/schema.sql`, and run it

The schema creates 11 tables, 1 junction table, 2 views, 9 indexes, and 1 stored procedure (`accept_offer`).

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/listings | All listings with optional filters |
| GET | /api/listings/:id | Single listing detail |
| POST | /api/listings | Create listing |
| PUT | /api/listings/:id | Update listing |
| DELETE | /api/listings/:id | Delete listing |
| GET | /api/properties | All properties |
| POST | /api/properties | Create property |
| PUT | /api/properties/:id | Update property |
| DELETE | /api/properties/:id | Delete property |
| GET | /api/agents | All agents |
| POST | /api/agents | Create agent |
| PUT | /api/agents/:id | Update agent |
| DELETE | /api/agents/:id | Delete agent |
| GET | /api/buyers | All buyers |
| POST | /api/buyers | Create buyer |
| PUT | /api/buyers/:id | Update buyer |
| DELETE | /api/buyers/:id | Delete buyer |
| GET | /api/showings | All showings |
| POST | /api/showings | Create showing |
| PUT | /api/showings/:id | Update showing |
| DELETE | /api/showings/:id | Delete showing |
| GET | /api/offers/listing/:id | Offers for a listing |
| POST | /api/offers | Create offer |
| POST | /api/offers/accept | Accept offer (transaction) |
| PUT | /api/offers/:id | Update offer status |
| DELETE | /api/offers/:id | Delete offer |
| GET | /api/contracts | All contracts |
| POST | /api/contracts | Create contract |
| PUT | /api/contracts/:id | Update contract |
| DELETE | /api/contracts/:id | Delete contract |
| GET | /api/inspections | All inspections |
| POST | /api/inspections | Create inspection |
| PUT | /api/inspections/:id | Update inspection |
| DELETE | /api/inspections/:id | Delete inspection |
| GET | /api/reports/active-listings | View 1: active listings with neighborhood data |
| GET | /api/reports/agent-performance | View 2: agent days-on-market stats |
