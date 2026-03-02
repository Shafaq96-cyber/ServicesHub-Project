const mysql = require('mysql2');

// Database connection parameters 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Agar aapne XAMPP mein user change nahi kiya to 'root' hi hoga
    password: '1234',      // XAMPP mein aksar password khali (empty) hota hai
    database: 'serviceshub_db' // Jo database humne abhi banaya hai
});

// Check connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database successfully!');
});

module.exports = db;