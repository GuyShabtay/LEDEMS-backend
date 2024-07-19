
const PORT = 8000;
const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
app.use(cors());
app.use(express.json());
const SECRET_KEY = process.env.SECRET_KEY;

// User registration
app.post('/register', async (req, res) => {
  const { userName, id, password } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM ledems."Users" WHERE id = $1', [id]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO ledems."Users" (user_name, id, password) VALUES ($1, $2, $3) RETURNING *',
      [userName, id, hashedPassword]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// User login
app.post('/login', async (req, res) => {
  const { id, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM ledems."Users" WHERE id = $1', [id]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid ID or Password' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid ID or Password' });
    }
    const token = jwt.sign({ id: user.rows[0].id }, SECRET_KEY, { expiresIn: '1h' });
    const userName=user.rows[0].user_name;
    res.json({ token,userName });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const allUsers = await pool.query('SELECT * FROM ledems."Users"');
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a suspect
app.post('/suspects', async (req, res) => {
  const { id, name } = req.body;

  try {
    const suspectExists = await pool.query('SELECT * FROM ledems."Suspects" WHERE id = $1', [id]);
    if (suspectExists.rows.length > 0) {
      return res.status(400).json({ error: 'Suspect with this ID already exists' });
    }
    const newSuspect = await pool.query(
      'INSERT INTO ledems."Suspects" (id, name) VALUES ($1, $2) RETURNING *',
      [id, name]
    );

    res.json(newSuspect.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add evidence
app.post('/evidences', async (req, res) => {
  const { suspectName, type, description, suspectId,fileName,fileUrl } = req.body;
  try {
    const newEvidence = await pool.query(
      'INSERT INTO ledems."Evidences" (suspect_name, type, description, date, suspect_id,file_name, file_url) VALUES ($1, $2, $3, CURRENT_DATE, $4, $5,$6) RETURNING *',
      [suspectName, type, description, suspectId,fileName,fileUrl]
    );

    res.json(newEvidence.rows[0]);
  } catch (err) {
    console.error('Error adding evidence:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get all evidences for a specific suspect suspect ID
app.get('/evidences/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const evidences = await pool.query('SELECT * FROM ledems."Evidences" WHERE suspect_id = $1', [id]);
    res.json(evidences.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a suspect by suspect ID
app.get('/suspects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const suspect = await pool.query('SELECT * FROM ledems."Suspects" WHERE id = $1', [id]);
    
    if (suspect.rows.length === 0) {
      return res.status(404).json({ error: 'Suspect not found' });
    }

    res.json(suspect.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Upldate evidence
app.put('/evidences/:id', async (req, res) => {
  const { id } = req.params;
  const { type, description,fileName, fileUrl } = req.body;
  
  try {
    const updatedEvidence = await pool.query(
      'UPDATE ledems."Evidences" SET type = $1, description = $2, file_name = $3,file_url = $4 WHERE id = $5 RETURNING *',
      [type, description,fileName, fileUrl, id]
    );
    if (updatedEvidence.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    res.json(updatedEvidence.rows[0]);
  } catch (err) {
    console.error('Error updating evidence:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete evidence
app.delete('/evidences/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ledems."Evidences" WHERE id = $1', [id]);
    res.json({ message: 'Evidence deleted successfully' });
  } catch (err) {
    console.error('Error deleting evidence:', err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});