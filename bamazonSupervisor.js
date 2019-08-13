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
      case "View Product Sales by Department":
        viewSalesByDepartment();
        break;

      case "Create New Department":
        // createDepartment();
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
      departments INNER JOIN products 
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