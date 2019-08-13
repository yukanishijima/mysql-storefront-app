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
  askQuestion();
});

let addSku = "";
let addQty = "";
let stockQty = "";
let itemId = "";

const askQuestion = () => {
  inquirer.prompt([
    {
      type: "list",
      message: "Select a task!",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
      name: "tasks"
    }
  ]).then(function (answers) {
    switch (answers.tasks) {
      case "View Products for Sale":
        viewProducts();
        break;

      case "View Low Inventory":
        viewLowInventory();
        break;

      case "Add to Inventory":
        addInventory();
        break;

      case "Add New Product":
        addNewProducts();
        break;

      case "Exit":
        console.log("\nBye bye!\n");
        process.exit();
        connection.end();
    }
  });
}

const viewProducts = () => {
  let query = "SELECT item_id AS SKU, product_name AS product, price, stock_quantity AS stock FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    setTimeout(askQuestion, 1000);
  });
}

const viewLowInventory = () => {
  let query = "SELECT item_id AS SKU, product_name AS product, price, stock_quantity AS stock FROM products WHERE stock_quantity < 5";
  connection.query(query, function (err, res) {
    if (err) throw err;
    if (res.length === 0) {
      console.log("\nNo items are low in stock!\n");
    } else {
      console.log(res);
    }
    setTimeout(askQuestion, 1000);
  });
}


const updateProducts = () => {

  //get stock_quantity
  connection.query(`SELECT stock_quantity FROM products WHERE ?`,
    {
      item_id: addSku
    },
    function (err, res) {
      if (err) throw err;
      stockQty = parseFloat(res[0].stock_quantity);
      console.log(`stock qty: ${stockQty}`);

      //update the products table
      connection.query(`UPDATE products SET ? WHERE ?`,
        [
          {
            stock_quantity: stockQty + addQty
          },
          {
            item_id: addSku
          }
        ],
        function (err, res) {
          if (err) throw err;
          console.log("\nStock relenished!\n");
          setTimeout(askQuestion, 1000);
        }
      );

    });
}

const isValidSku = (input) => {
  let number = parseFloat(input);
  if (!Number.isInteger(number) || number < 1 || number > itemId) {
    return "Enter a valid SKU number!";
  } else {
    return true;
  };
};

const addInventory = () => {

  //check how many SKUs there are (for isValidSku function)
  connection.query(`SELECT item_id FROM products`, function (err, res) {
    itemId = res.length;

    //ask questions for replenishment
    inquirer.prompt([
      {
        type: "input",
        message: "Which SKU do you want to replenish?",
        name: "sku",
        validate: isValidSku
      },
      {
        type: "input",
        message: "How many units do you want to add?",
        name: "quantity"
      }
    ]).then(function (answers) {
      addSku = answers.sku;
      addQty = parseFloat(answers.quantity);

      inquirer.prompt([
        {
          type: "confirm",
          message: `Is this correct? \nSKU to add: ${addSku} \nUnit(s) to add: ${addQty}`,
          name: "correct"
        }
      ]).then(function (answer) {
        switch (answer.correct) {
          case true:
            updateProducts();
            break;

          case false:
            addInventory();
            break;
        }
      });
    });


  });
}

const addNewProducts = () => {

  let newProduct = "";
  let newDepartment = "";
  let newPrice = "";
  let newUnits = "";

  inquirer.prompt([
    {
      type: "input",
      message: "What is the name of the new product?",
      name: "newProduct"
    },
    {
      type: "list",
      message: "What is the depeartment?",
      choices: ["Electronics", "Kitchen", "Home", "Food"],
      name: "newDepartment"
    },
    {
      type: "input",
      message: "How much is it?",
      name: "newPrice"
    },
    {
      type: "input",
      message: "How many units do you want to add?",
      name: "newUnits"
    }
  ]).then(function (answers) {

    newProduct = answers.newProduct;
    newDepartment = answers.newDepartment;
    newPrice = parseFloat(answers.newPrice).toFixed(2);
    newUnits = answers.newUnits;

    connection.query(
      `INSERT INTO products SET ?`,
      {
        product_name: newProduct,
        department_name: newDepartment,
        price: newPrice,
        stock_quantity: newUnits
      },
      function (err, res) {
        if (err) throw err;
        console.log("\nProducts added successfully!\n");
        setTimeout(askQuestion, 1000);
      });

  });
}