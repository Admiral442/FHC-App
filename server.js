// server.js

const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// PostgreSQL database configuration
const pool = new Pool({
  user: '', 
  host: 'localhost',
  database: 'postgres', 
  password: '', 
  port: 5000, 
});

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to use session
app.use(session({
  secret: '9820467284636515374856382957329583',
  resave: false,
  saveUninitialized: true
}));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  if (req.session.loggedIn) {
    console.log('User is logged in.');
    next();
  } else {
    console.log('User is not logged in.');
    res.redirect('/login.html');
  }
};

// Middleware to render admin.html with loggedIn variable
app.get('/admin', authenticateUser, (req, res) => {
  // Check if user is logged in
  const loggedIn = req.session.loggedIn || false;

  // Render admin.html with loggedIn variable
  res.render('admin', { loggedIn }); // Assuming your EJS file is named admin.ejs
});

// Handle admin login
app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    client.release();
    if (result.rows.length === 1) {
      req.session.loggedIn = true; // Set loggedIn to true in the session
      res.status(200).send('Login successful!');
    } else {
      res.status(401).send('Invalid username or password.');
    }
  } catch (error) {
    console.error('Error executing login query', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// Route to render dashboard page
app.get('/dashboard', authenticateUser, (req, res) => {
  res.render('dashboard'); // Assuming your EJS file is named dashboard.ejs
});

// Route to handle new membership application form submission
app.post('/submit-application', async (req, res) => {
  const { fullName, email, phone, emergencyContact, membershipFee } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO membership_applications (full_name, email, phone, emergency_contact, membership_fee) VALUES ($1, $2, $3, $4, $5)',
      [fullName, email, phone, emergencyContact, membershipFee]
    );
    client.release();
    res.status(200).send('Application submitted successfully!');
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// Route to fetch membership applications
app.get('/get-applications', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM membership_applications');
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).send('An error occurred while fetching applications.');
  }
});

// Route to approve a membership application
app.post('/approve-application/:id', async (req, res) => {
  const applicationId = req.params.id;
  try {
    const client = await pool.connect();
    await client.query('UPDATE membership_applications SET approved = true WHERE id = $1', [applicationId]);
    client.release();
    res.sendStatus(200);
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).send('An error occurred while approving the application.');
  }
});

// Route to deny a membership application
app.post('/deny-application/:id', async (req, res) => {
  const applicationId = req.params.id;
  try {
    const client = await pool.connect();
    await client.query('UPDATE membership_applications SET approved = false WHERE id = $1', [applicationId]);
    client.release();
    res.sendStatus(200);
  } catch (error) {
    console.error('Error denying application:', error);
    res.status(500).send('An error occurred while denying the application.');
  }
});

// Route to fetch statistics
app.get('/statistics', async (req, res) => {
  try {
    const client = await pool.connect();
    const totalActiveMembersResult = await client.query('SELECT COUNT(*) FROM active_members');
    const applicationsNeedingReviewResult = await client.query('SELECT COUNT(*) FROM membership_applications WHERE approved = false');
    client.release();
    const statistics = {
      totalActiveMembers: totalActiveMembersResult.rows[0].count,
      applicationsNeedingReview: applicationsNeedingReviewResult.rows[0].count,
    };
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send('An error occurred while fetching statistics.');
  }
});

app.get('/profile', async (req, res) => {
  try {
    // Ensure that the user is authenticated
    if (!req.session.email) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const email = req.session.email;

    // Retrieve user data including username, email, and role
    const query = 'SELECT username, email, role FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Extract user data from the result
    const userData = result.rows[0];

    // Render the profile view with the user data
    res.render('profile', { userData }); // Rendering the profile.ejs template with userData
  } catch (err) {
    console.error('Error retrieving user information:', err);
    res.status(500).json({ success: false, error: 'Error fetching profile data' });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
