# Clinic Management System Backend

Node.js + SQLite backend for the Clinic Management System.

## Setup Instructions

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Or production mode
   npm start
   ```

4. **Server will run on:**
   - URL: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients?search=query` - Search patients
- `POST /api/patients` - Create new patient

### Visits
- `POST /api/visits` - Create new visit/token
- `PUT /api/visits/:id/complete` - Mark visit as completed

## Database

SQLite database file (`clinic.db`) will be automatically created in the server directory.

### Tables:
- **patients**: Patient information
- **visits**: Visit records and tokens
- **token_counter**: Daily token counter (resets daily)

## Features

- ✅ Daily auto-resetting token system
- ✅ Patient management with unique IDs
- ✅ Visit tracking with status (pending/completed)
- ✅ Consultation fee tracking
- ✅ Search functionality
- ✅ Dashboard statistics

## Frontend Integration

Make sure to update your frontend to connect to `http://localhost:3001/api` when running locally.