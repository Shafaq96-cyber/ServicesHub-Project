const express = require('express');
const path = require('path');
const db = require('./config/db'); // Database connection

const app = express();

// Middleware
app.use(express.json()); // JSON data handle karne ke liye
app.use(express.static(path.join(__dirname, 'public'))); // Static files ke liye

// --- Frontend Routes ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// --- Backend APIs (CRUD Operations) ---

// 1. Get Services (Read Operation)
app.get('/api/services', (req, res) => {
    const sql = "SELECT * FROM services";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Fetch Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// 2. Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server mein masla hai" });
        }
        if (results.length > 0) {
            res.status(200).json({ 
                message: "Login Successful!", 
                user: { id: results[0].id, fullname: results[0].fullname, role: results[0].role } 
            });
        } else {
            res.status(401).json({ message: "Ghalat Email ya Password!" });
        }
    });
});

// 3. Signup API (Create)
app.post('/api/signup', (req, res) => {
    const { fullname, email, password, role } = req.body;
    const sql = "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [fullname, email, password, role], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        res.status(201).json({ message: "Success" });
    });
});

// 4. Service Book karna (Create)
app.post('/api/book', (req, res) => {
    const { user_id, service_id } = req.body;
    const sql = "INSERT INTO bookings (user_id, service_id, status) VALUES (?, ?, 'Pending')";
    
    db.query(sql, [user_id, service_id], (err, result) => {
        if (err) {
            console.error("Booking Error:", err);
            return res.status(500).json({ message: "Booking nahi ho saki" });
        }
        res.status(201).json({ message: "Service Booked Successfully!", bookingId: result.insertId });
    });
});

// --- Provider/Admin APIs ---

// 5. Bookings dekhna (Read with JOIN)
app.get('/api/admin/bookings', (req, res) => {
    const sql = `
        SELECT bookings.id, users.fullname as customer_name, 
        services.service_name, bookings.status, bookings.booking_date 
        FROM bookings 
        JOIN users ON bookings.user_id = users.id 
        JOIN services ON bookings.service_id = services.id`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

// 6. Status update karna (Update)
app.put('/api/bookings/status', (req, res) => {
    const { booking_id, status } = req.body;
    const sql = "UPDATE bookings SET status = ? WHERE id = ?";
    
    db.query(sql, [status, booking_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        res.json({ message: "Status Updated!" });
    });
});

// --- Server Start ---
const PORT = 3000; 

// 7. Booking Delete/Cancel karna (Delete Operation)
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const sql = "DELETE FROM bookings WHERE id = ?";
    
    db.query(sql, [bookingId], (err, result) => {
        if (err) {
            console.error("Delete Error:", err);
            return res.status(500).json({ error: "Booking delete nahi ho saki" });
        }
        res.json({ message: "Booking successfully cancel ho gayi!" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});