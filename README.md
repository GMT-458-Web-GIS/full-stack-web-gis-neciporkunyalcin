# Nerede Yesek? - Social Food Map 

**GMT 458 Web GIS Final Project**

An interactive social food map application that helps users discover restaurants in Ankara, check-in to earn XP, and make group dining decisions with friends.

---

##  Assignment Requirements Implementation Report

This project implements the following "Mix and Match" options from the final assignment provisions:

| Requirement Feature | Weight | Implementation Details |
| :--- | :--- | :--- |
| **Authentication** | **15%** | **Implemented.** Users sign up and login using JWT (JSON Web Tokens) and secure password hashing with Bcrypt. |
| **Managing User Types** | **20%** | **Implemented.** The system supports multiple user roles defined in `User.js`: `free`, `premium`, `restaurant_owner`, and `admin`. |
| **NoSQL Database** | **25%** | **Implemented.** The project uses **MongoDB** instead of a relational database to handle heterogeneous restaurant data and flexible GeoJSON schemas. |
| **Performance Monitoring** | **25%** | **Implemented.** Utilization of **Spatial Indices (`2dsphere`)** for optimized geospatial queries and regular indices for sorting by rating. |
| **API Development** | **25%** | **Implemented.** RESTful API exposing spatial resources (Restaurants) and non-spatial resources (User profiles, Squads). |
| **CRUD Operations** | **15%** | **Implemented.** Complete CRUD cycle: **Create** (add restaurants), **Read** (view map/nearby), **Update** (edit restaurant/user location), and **Delete** (remove restaurants). |

###  Technical Report

#### 1. Managing Different User Types
The application is designed to handle different tiers of users, stored in the `user_type` field of the User model.
- **Free Users:** Standard access to the map and voting.
- **Premium Users:** Future-proofed for advanced filters and squad features.
- **Restaurant Owners:** Can register new venues and manage them.
- **Admins:** System oversight.
*Implementation:* See `backend/models/User.js` (Enum validation).

#### 2. NoSQL Database & Heterogeneity
Web-based GIS systems often require handling data with varying structures. MongoDB was chosen to store Restaurant data which can have varying attributes (amenities, hours) without rigid schema migrations.
- **Reasoning:** GeoJSON objects support is native in MongoDB, making it superior for simpler Web GIS applications compared to setting up PostGIS for this scale.

#### 3. Performance Monitoring (Indexing)
To ensure the map stays responsive even with thousands of points, we utilized MongoDB's Geospatial Indexing.
- **`2dsphere` Index:** Applied to `Restaurant.location` and `User.location`. This allows `$near` queries to execute in logarithmic time rather than scanning the entire collection (O(log n) vs O(n)).
- **Compound Indexing:** Used for sorting restaurants by rating efficiently.

---

##  Features

-   **Interactive Map:** Visualizes restaurants using Leaflet.js with custom markers.
-   **Geospatial Search:** "Find Nearby" feature calculates distances on the server-side.
-   **Gamification:** Users earn XP for check-ins and adding content.
    -   **Level System:** XP thresholds determine user levels.
-   **Social Squads:** Create groups, **invite friends**, and vote on food types with **collaborative polling**.
-   **Review System:** Rate and review restaurants (1-5 Stars). Real-time average rating updates.
-   **Notification System:** Real-time alerts for squad invites and updates.

##  Technology Stack

-   **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT.
-   **Frontend:** React, React-Leaflet, TailwindCSS (for styling).
-   **Geospatial:** GeoJSON, OpenStreetMap (Nominatim).

##  Installation & Setup

### Prerequisites
-   Node.js (v14+)
-   MongoDB (Local service or Atlas URL)

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure Environment
# Create a .env file in /backend with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/nerede_yesek
# JWT_SECRET=your_jwt_secret_key

# Run Server
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run Client
npm start
```

Access the application at [http://localhost:3000](http://localhost:3000).

##  API Reference

### Auth
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - Authenticate & get Token

### Restaurants (Spatial Resource)
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/nearby?lat=...&lon=...&radius=2000` - **Spatial Query**
- `POST /api/restaurants` - Create new restaurant (Owner only)
- `PUT /api/restaurants/:id` - Update restaurant (Owner only)
- `DELETE /api/restaurants/:id` - Delete restaurant (Owner only)
- `GET /api/restaurants/search?q=kebab` - Text Search

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/leaderboard` - Gamification leaderboard

### Squads & Collaboration
- `POST /api/squads` - Create a squad
- `POST /api/squads/:id/invite` - **Invite member** (Notifications)
- `POST /api/polls` - Create voting poll
- `POST /api/polls/:id/vote` - Vote in a poll

### Reviews
- `POST /api/restaurants/:id/reviews` - Add rate & review
- `GET /api/restaurants/:id/reviews` - Get recent reviews


