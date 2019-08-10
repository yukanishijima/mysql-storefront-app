require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection(
  {
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.PASSWORD,
    database: "bamazon_db"
  }
);

connection.connect(function (err) {
  if (err) throw err;
  // console.log("connected with id of " + connection.threadId);
  console.log("\nWelcome to Bamazon!\n");
  showProducts();
  setTimeout(takeOrder, 1000);
  // connection.end();
});

const showProducts = () => {
  let query = "SELECT * FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    console.log();
  });
};

const takeOrder = () => {
  inquirer.prompt([
    {
      type: "input",
      message: "What is the SKU of the product you want to buy?",
      name: "sku",
      // validate: validateSkuFunc,
    },
    {
      type: "input",
      message: "How many units do you want to buy?",
      name: "quantity",
      // validate: validateQtyFunc,
    }
  ]).then(function (res) {
    console.log(res.sku, res.quantity);

    //check if there's stock

    //if no, print "Sorry, insufficient quantity!"
    //inquirer "Keep shopping" or "Exit"

    //if yes, update the db
    //once the update is complete, print the total cost

    process.exit();
  });
}
