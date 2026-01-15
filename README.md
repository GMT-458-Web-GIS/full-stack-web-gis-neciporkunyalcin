# Nerede Yesek? - Social Food Map 🥙

**GMT 458 Web GIS Final Project**

An interactive social food map application that helps users discover restaurants in Ankara, check-in to earn XP, and make group dining decisions with friends.

## 🚀 What's New?

-   **Full MongoDB Migration:** The entire database layer has been migrated from PostgreSQL to MongoDB for better scalability and flexibility.
-   **Modern UI/UX:** A completely redesigned interface with a glassmorphism aesthetic, dark mode inspired themes, and smooth animations.
-   **Features:**
    -   **Auto-fill Address:** Click on the map to automatically fetch and fill the address.
    -   **Food Squads:** Create squads and vote on where to eat.
    -   **Challenges:** Participate in seasonal food challenges.
    -   **Leaderboard:** Compete with other foodies for the top spot.

## ✨ Features

-   **Interactive Map:** Explore restaurants, filter by cuisine/price, and find spots nearby using geospatial queries.
-   **Gamification:** Earn XP by checking in and adding new spots. Level up and unlock badges.
-   **Social Eating:**
    -   **Squads:** Form groups with friends.
    -   **Voting:** Democratically decide on the next meal location.
-   **Responsive Design:** Works seamlessly on desktop and mobile.

## 🛠️ Technology Stack

**Backend:**
-   **Node.js & Express:** RESTful API server.
-   **MongoDB (Mongoose):** NoSQL database with geospatial indexing (`2dsphere`).
-   **JWT:** Secure authentication.

**Frontend:**
-   **React:** Component-based UI.
-   **Leaflet (React-Leaflet):** Interactive maps.
-   **OpenStreetMap (Nominatim):** Map tiles and reverse geocoding.
-   **CSS Variables:** Modern and consistent styling system.

## 📦 Installation

### Prerequisites
-   Node.js (v14+)
-   MongoDB (Local or Atlas)

### 1. Clone & Setup Backend
```bash
cd backend
npm install

# Create a .env file locally with the following:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/nerede_yesek
# JWT_SECRET=your_super_secret_key

# Run the server
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install

# Run the application
npm start
```

### 3. Access
-   **Frontend:** http://localhost:3000
-   **Backend API:** http://localhost:5000

## 📍 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Login and get token |
| `GET` | `/api/restaurants` | Get all restaurants |
| `GET` | `/api/restaurants/nearby` | Find restaurants near a point |
| `POST` | `/api/squads` | Create a new food squad |
| `GET` | `/api/users/leaderboard` | Get top users |

## 📂 Project Structure

```
nerede-yesek/
├── backend/            # Express API & MongoDB Models
│   ├── config/         # DB Connection
│   ├── controllers/    # Logic for Auth, Restaurants, etc.
│   ├── models/         # Mongoose Schemas (User, Reactaurant, Squad...)
│   └── routes/         # API Routes
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Widgets (MapView, Leaderboard...)
│   │   ├── pages/      # Full pages (Home, Login, Profile)
│   │   └── services/   # API & Auth integration
└── README.md           # This file
```

---
*Created by Necip Orkun Yalçın for GMT 458 Web GIS Course.*
