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

let userSku = "";
let userQty = "";
let stockQty = "";

connection.connect(function (err) {
  if (err) throw err;
  // console.log("connected with id of " + connection.threadId);
  showProducts();
});

const showProducts = () => {
  let query = "SELECT * FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\nWelcome to Bamazon!\n");
    console.table(res);
    console.log();
    setTimeout(takeOrder, 500);
  });
};

const isValidSku = (input) => {
  let number = parseFloat(input);
  if (!Number.isInteger(number) || number < 1 || number > 10) {
    return "Enter a valid SKU number!";
  } else {
    return true;
  };
};

const isStockEnough = () => {
  if (stockQty < userQty) {
    console.log("\nSorry, insufficient quantity :(\n");
    inquirer.prompt([
      {
        type: "confirm",
        message: "Do you want to keep shopping?",
        name: "wantToShop"
      }
    ]).then(function (res) {
      switch (res.wantToShop) {
        case true:
          takeOrder();
          break;

        case false:
          console.log("\nBye bye!\n");
          process.exit();
          break;
      }
    });

  } else {
    console.log("Thank you for shopping with us!");
    //update the db
    //once the update is complete, print the total cost
    process.exit();
  }
};

const takeOrder = () => {
  inquirer.prompt([
    {
      type: "input",
      message: "What is the SKU of the product you want to buy?",
      name: "sku",
      validate: isValidSku
    },
    {
      type: "input",
      message: "How many units do you want to buy?",
      name: "quantity",
    }
  ]).then(function (answer) {
    userSku = answer.sku;
    userQty = answer.quantity;

    //check if there's stock
    let query = "SELECT stock_quantity FROM products WHERE item_id = ?";
    connection.query(query, [answer.sku], function (err, res) {
      if (err) throw err;
      stockQty = res[0].stock_quantity;
      isStockEnough();
    });
  });
}
