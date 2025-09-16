const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'clinic.db'));
    this.init();
  }

  init() {
    // Create tables
    this.db.serialize(() => {
      // Patients table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          date_of_birth DATE NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          address TEXT NOT NULL,
          medical_history TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Visits table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS visits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id TEXT NOT NULL,
          token_number INTEGER NOT NULL,
          reason_for_visit TEXT NOT NULL,
          status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
          consultation_fee DECIMAL(10,2),
          issue_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          completion_time DATETIME,
          visit_date DATE DEFAULT (DATE('now')),
          FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
      `);

      // Token counter table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS token_counter (
          date DATE PRIMARY KEY,
          last_token INTEGER DEFAULT 0
        )
      `);

      console.log('Database initialized successfully');
    });
  }

  // Generate next token number for today
  getNextToken(callback) {
    const today = new Date().toISOString().split('T')[0];
    
    this.db.get(
      'SELECT last_token FROM token_counter WHERE date = ?',
      [today],
      (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        
        const nextToken = row ? row.last_token + 1 : 1;
        
        // Update or insert token counter
        this.db.run(
          'INSERT OR REPLACE INTO token_counter (date, last_token) VALUES (?, ?)',
          [today, nextToken],
          (err) => {
            if (err) {
              callback(err, null);
            } else {
              callback(null, nextToken);
            }
          }
        );
      }
    );
  }

  // Patient methods
  createPatient(patient, callback) {
    const { name, dateOfBirth, phone, email, address, medicalHistory } = patient;
    
    // Generate patient ID
    this.db.get(
      'SELECT COUNT(*) as count FROM patients',
      (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        
        const patientId = `P${String(row.count + 1).padStart(3, '0')}`;
        
        this.db.run(
          `INSERT INTO patients (id, name, date_of_birth, phone, email, address, medical_history)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [patientId, name, dateOfBirth, phone, email, address, medicalHistory],
          function(err) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, { id: patientId, ...patient });
            }
          }
        );
      }
    );
  }

  getAllPatients(callback) {
    this.db.all(
      `SELECT p.*, 
              v.token_number, v.reason_for_visit, v.status, v.consultation_fee,
              v.issue_time, v.completion_time, v.visit_date
       FROM patients p
       LEFT JOIN visits v ON p.id = v.patient_id AND v.visit_date = DATE('now')
       ORDER BY p.created_at DESC`,
      callback
    );
  }

  searchPatients(query, callback) {
    this.db.all(
      `SELECT p.*, 
              v.token_number, v.reason_for_visit, v.status, v.consultation_fee,
              v.issue_time, v.completion_time, v.visit_date
       FROM patients p
       LEFT JOIN visits v ON p.id = v.patient_id AND v.visit_date = DATE('now')
       WHERE p.name LIKE ? OR p.id LIKE ? OR p.phone LIKE ?
       ORDER BY p.created_at DESC`,
      [`%${query}%`, `%${query}%`, `%${query}%`],
      callback
    );
  }

  // Visit methods
  createVisit(patientId, reasonForVisit, callback) {
    this.getNextToken((err, tokenNumber) => {
      if (err) {
        callback(err, null);
        return;
      }
      
      this.db.run(
        `INSERT INTO visits (patient_id, token_number, reason_for_visit, status, issue_time)
         VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
        [patientId, tokenNumber, reasonForVisit],
        function(err) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, { id: this.lastID, tokenNumber });
          }
        }
      );
    });
  }

  completeVisit(visitId, consultationFee, callback) {
    this.db.run(
      `UPDATE visits 
       SET status = 'completed', consultation_fee = ?, completion_time = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [consultationFee, visitId],
      callback
    );
  }

  // Dashboard stats
  getDashboardStats(callback) {
    const today = new Date().toISOString().split('T')[0];
    
    this.db.all(`
      SELECT 
        COUNT(CASE WHEN v.visit_date = ? THEN 1 END) as totalPatientsToday,
        COUNT(CASE WHEN v.status = 'pending' AND v.visit_date = ? THEN 1 END) as pendingPatients,
        COUNT(CASE WHEN v.status = 'completed' AND v.visit_date = ? THEN 1 END) as completedToday
      FROM visits v
    `, [today, today, today], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        const stats = rows[0] || { totalPatientsToday: 0, pendingPatients: 0, completedToday: 0 };
        callback(null, stats);
      }
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;