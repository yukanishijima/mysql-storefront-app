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

connection.connect(function (err) {
  if (err) throw err;
  // console.log("connected with id of " + connection.threadId);
  deleteSummary();
  showProducts();
});

const deleteSummary = () => {
  connection.query(`DELETE FROM summary`, function (err, res) {
    if (err) throw err;
  });
}

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

const showSummary = () => {
  connection.query(
    `SELECT * FROM summary`,
    function (err, res) {
      if (err) throw err;
      console.log("Here is your order summary!");
      console.table(res);
      //calculate the total cost and show it here
      console.log("Total cost is: ???");
      process.exit();
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
  if (!Number.isInteger(number) || number < 1 || number > 10) {
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
            console.log("\nBye bye!\n");
            process.exit();
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
}
