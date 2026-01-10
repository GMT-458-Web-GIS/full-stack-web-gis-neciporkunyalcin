# Nerede Yesek? - Social Food Map

**GMT 458 Web GIS Final Project**

## 📌 What is This?

Discover restaurants in Ankara on a map, check-in to earn points, make group decisions with friends!

### Features
- 🗺️ Interactive map (filtering, search)
- 🎯 Gamification (XP, levels, badges)
- 🏆 Leaderboard
- 🎮 Food Challenges
- 👥 Food Squad (group voting)

## 🚀 Installation

### Requirements
- Node.js
- PostgreSQL + PostGIS
- MongoDB

### Quick Start
```bash
# 1. Backend
cd backend
npm install
# Edit .env file
npm run dev

# 2. Database
createdb nerede_yesek
psql -d nerede_yesek -f database/init-postgres.sql
node database/init-mongodb.js

# 3. Frontend
cd frontend
npm install
npm start
```

**Run:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 💻 Technologies

**Backend:** Node.js, Express, PostgreSQL+PostGIS, MongoDB, JWT  
**Frontend:** React, Leaflet, Axios

## 🗄️ Database

**PostgreSQL:** users, restaurants (PostGIS Point)  
**MongoDB:** reviews, challenges, squads

## 📡 API Examples
```
POST /api/auth/register          → Register
POST /api/auth/login             → Login
GET  /api/restaurants/nearby     → Nearby restaurants
POST /api/restaurants/checkin    → Check-in (earn 10 XP)
GET  /api/challenges             → Challenge list
POST /api/squads                 → Create group
```

## ✅ GMT 458 Requirements

- ✅ GitHub code management (10%)
- ✅ User types: Free, Premium, Owner, Admin (20%)
- ✅ Performance monitoring: R-Tree, B-Tree indexes (25%)
- ✅ CRUD operations (15%)
- ✅ Authentication: JWT (15%)
- ✅ NoSQL: MongoDB nested documents (25%)
- ✅ Performance testing: Load tests (25%)
- ✅ API development: RESTful (25%)
- ✅ GeoServer: WMS/WFS (25%)
- ✅ AWS Hosting (20%)

## 📂 Project Structure
```
nerede-yesek/
├── backend/        → API (Node.js + Express)
├── frontend/       → Web UI (React)
├── database/       → Setup scripts
└── README.md
```
