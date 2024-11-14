require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.USER,
    password: process.env.PWD,
    database: 'industrial_db',
});

// Read and parse the JSON file
const data = JSON.parse(fs.readFileSync('C:/ProgramData/MySQL/MySQL Server 9.1/Uploads/industrial.json', 'utf8'));

// Function to insert product data
const insertData = async () => {
    try {
        for (const product of data) {
            const { name, articleNumber, price, description } = product;
            const query = 'INSERT INTO products (name, articleNumber, price, description) VALUES (?, ?, ?, ?)';
            
            // Wait for the query to complete before moving on to the next
            const [result] = await connection.promise().query(query, [name, articleNumber, price, description]);
            console.log(`Inserted product with ID: ${result.insertId}`);
        }
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        // Close the connection after all inserts
        connection.end(err => {
            if (err) {
                console.error('Error closing the connection:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
};

// Run the insert operation
insertData();