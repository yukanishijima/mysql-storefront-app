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
  console.log("connected with id of " + connection.threadId);
  askQuestion();
});


let newDepartment = "";
let newCosts = "";


const askQuestion = () => {
  inquirer.prompt([
    {
      type: "list",
      message: "Select option!",
      choices: ["View Sales by Department", "Create New Department", "Exit"],
      name: "option"
    }
  ]).then(function (answers) {
    switch (answers.option) {
      case "View Sales by Department":
        viewSalesByDepartment();
        break;

      case "Create New Department":
        createDepartment();
        break;

      case "Exit":
        console.log("\nBye bye!\n");
        process.exit();
        connection.end();
        break;
    }
  });
}


const viewSalesByDepartment = () => {

  connection.query(`
    SELECT 
      departments.department_id AS 'department ID', 
      departments.department_name AS 'department name', 
      departments.over_head_costs AS 'over head costs',
      SUM(products.product_sales) AS 'product sales',
      (SUM(products.product_sales) - departments.over_head_costs) AS 'total profit'
    FROM 
      departments LEFT JOIN products 
    ON 
      departments.department_name = products.department_name
    GROUP BY 
      departments.department_id
  `,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      connection.end();
    });
}

const createDepartment = () => {
  inquirer.prompt([
    {
      type: "input",
      message: "Deparment name?",
      name: "newDepartment"
    },
    {
      type: "input",
      message: "Deparment over head cost?",
      name: "newCosts"
    }
  ]).then(function (answers) {
    newDepartment = answers.newDepartment;
    newCosts = answers.newCosts;
    insertDepartments();
  });
}

const insertDepartments = () => {
  connection.query(`INSERT INTO departments SET ?`,
    {
      department_name: newDepartment,
      over_head_costs: newCosts
    },
    function (err, res) {
      if (err) throw err;
      console.log(`\nNew department inserted successfully!\n`);
      connection.end();
    });
}
