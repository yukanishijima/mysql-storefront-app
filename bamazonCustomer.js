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
let userOrder = "";
let userPrice = "";
let itemId = "";

connection.connect(function (err) {
  if (err) throw err;
  // console.log("connected with id of " + connection.threadId);
  deleteSummary();
  createSummary();
  showProducts();
});

const deleteSummary = () => {
  let query = `DROP TABLE IF EXISTS summary`;
  connection.query(query, function (err, res) {
    if (err) throw err;
  });
}

const createSummary = () => {
  let query = `CREATE TABLE IF NOT EXISTS summary (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(30),
    price DECIMAL(10,2),
    quantity INT(10),
    PRIMARY KEY(item_id)
  )`;
  connection.query(query, function (err, res) {
    if (err) throw err;
  });
}

const showProducts = () => {
  let query = "SELECT item_id AS SKU, product_name AS product, price, stock_quantity AS stock FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\nWelcome to Bamazon!\n");
    console.table(res);
    console.log();
    setTimeout(takeOrder, 500);
  });
};

const showSummary = () => {
  connection.query(
    `SELECT * FROM summary`,
    function (err, res) {
      if (err) throw err;
      console.log("\nThank you for shopping with us!\n");
      console.table(res);

      let totalCost = 0;
      for (var i = 0; i < res.length; i++) {
        totalCost = totalCost + res[i].price * res[i].quantity;
      }
      console.log(`Total cost is: ${totalCost}`);
      process.exit();
      connection.end();
    }
  );
}

const updateInventory = () => {
  //update the data
  connection.query(
    `UPDATE products SET ? WHERE ?`,
    [
      {
        stock_quantity: stockQty - userQty
      },
      {
        item_id: userSku
      }
    ],
    function (err, res) {
      if (err) throw err;
      // console.log("Inventory Updated!");
      getData();
    });

  //get the product name and price
  const getData = () => {
    connection.query(
      `SELECT product_name, price FROM products WHERE ?`,
      {
        item_id: userSku
      },
      function (err, res) {
        if (err) throw err;
        userOrder = res[0].product_name;
        userPrice = res[0].price.toFixed(2);
        insertSummary();
      });
  }

  // insert the data to summary table
  const insertSummary = () => {
    connection.query(
      "INSERT INTO summary SET ?",
      {
        product_name: userOrder,
        price: userPrice,
        quantity: userQty
      },
      function (err, res) {
        if (err) throw err;
        // console.log("Summary Updated!");

        inquirer.prompt([
          {
            type: "confirm",
            message: "Keep shopping?",
            name: "keepShopping"
          }
        ]).then(function (res) {
          switch (res.keepShopping) {
            case true:
              takeOrder();
              break;

            case false:
              inquirer.prompt([
                {
                  type: "confirm",
                  message: "Are you sure?",
                  name: "sure"
                }
              ]).then(function (res) {
                switch (res.sure) {
                  case true:
                    showSummary();
                    break;

                  case false:
                    takeOrder();
                    break;
                }
              });
              break;

          };
        });
      });
  }
};

const isValidSku = (input) => {
  let number = parseFloat(input);
  if (!Number.isInteger(number) || number < 1 || number > itemId) {
    return "Enter a valid SKU number!";
  } else {
    return true;
  };
};

const isStockEnough = () => {

  //get the stock quantity
  let query = `SELECT stock_quantity FROM products WHERE ?`;
  connection.query(query, { item_id: userSku }, function (err, res) {
    if (err) throw err;
    stockQty = res[0].stock_quantity;

    //if there's not enough stock,
    if (stockQty < userQty) {
      console.log("\nSorry, insufficient quantity :(\n");
      inquirer.prompt([
        {
          type: "confirm",
          message: "Keep shopping?",
          name: "keepShopping"
        }
      ]).then(function (res) {
        switch (res.keepShopping) {
          case true:
            showProducts();
            break;

          case false:
            showSummary();
            break;
        }
      });

      //if there's enough stock,
    } else {
      updateInventory();
    }
  });
};

const takeOrder = () => {

  //check how many SKUs there are (for isValidSku function)
  connection.query(`SELECT item_id FROM products`, function (err, res) {
    itemId = res.length;

    //take user's order
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
      isStockEnough();
    });

  });
}
