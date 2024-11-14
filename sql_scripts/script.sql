CREATE DATABASE IF NOT EXISTS industrial_db;
USE industrial_db;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    articleNumber VARCHAR(50),
    price DECIMAL(10, 2),
    description TEXT
);

CREATE TABLE orders (
    id INT NOT NULL,
    quantity INT NOT NULL,
    articleNumber VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM products;