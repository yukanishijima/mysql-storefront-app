DROP DATABASE IF EXISTS bamazon_db; 
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(30),
  department_name VARCHAR(30),
  price DECIMAL(10,2),
  stock_quantity INT(10),
  product_sales DECIMAL(10,2),
  PRIMARY KEY(item_id)
);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUE 
("MacBook Pro", "Electronics", 1699.00, 10),
("iRobot Roomba", "Electronics", 699.99, 10),
("Vitamix", "Kitchen", 550.00, 10),
("Coffee Grinder", "Kitchen", 150, 10),
("Rocking Chair", "Home", 100.00, 20),
("Aroma Difuser", "Home", 35.00, 20),
("Throw Blanket", "Home", 25.00, 20),
("Almond Milk", "Food", 4.99, 50),
("Protain Bar", "Food", 2.99, 50),
("Gummy Candy", "Food", 1.99, 50);

CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(30),
  over_head_costs DECIMAL(10,2),
  PRIMARY KEY(department_id)
);

SELECT * FROM products;
-- SELECT * FROM summary;
SELECT * FROM departments;

