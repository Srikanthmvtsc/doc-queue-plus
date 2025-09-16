const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

// Authentication (hardcoded for now)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'clinic123') {
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  db.getDashboardStats((err, stats) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(stats);
    }
  });
});

// Patient routes
app.get('/api/patients', (req, res) => {
  const { search } = req.query;
  
  if (search) {
    db.searchPatients(search, (err, patients) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(patients);
      }
    });
  } else {
    db.getAllPatients((err, patients) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(patients);
      }
    });
  }
});

app.post('/api/patients', (req, res) => {
  const patient = req.body;
  
  db.createPatient(patient, (err, newPatient) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json(newPatient);
    }
  });
});

// Visit routes
app.post('/api/visits', (req, res) => {
  const { patientId, reasonForVisit } = req.body;
  
  db.createVisit(patientId, reasonForVisit, (err, visit) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json(visit);
    }
  });
});

app.put('/api/visits/:id/complete', (req, res) => {
  const { id } = req.params;
  const { consultationFee } = req.body;
  
  db.completeVisit(id, consultationFee, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, message: 'Visit completed successfully' });
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clinic Management API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Clinic Management Server running on port ${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close();
  process.exit(0);
});