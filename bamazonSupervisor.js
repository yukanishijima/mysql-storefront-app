require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('tty-table');

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


let formatTable = (rows) => {
  let header = [
    {
      value: "department_id",
      alias: "ID",
      color: "yellow"
    },
    {
      value: "department_name",
      alias: "Department",
      color: "green",
      width: 20,
      align: "left"
    },
    {
      value: "over_head_costs",
      alias: "Over Head Costs",
      color: "cyan",
      width: 20,
      formatter: function (value) {
        let str = "$" + value.toFixed(2);
        return str;
      }
    },
    {
      value: "product_sales",
      alias: "Product Sales",
      color: "white",
      width: 20,
      formatter: function (value) {
        if (typeof value === 'number') {
          value = "$" + value.toFixed(2);
        }
        else {
          value = "0";
        }
        return value;
      }
    },
    {
      value: "total_profit",
      alias: "Total Profit",
      color: "white",
      width: 20,
      formatter: function (value) {
        if (typeof value === 'number') {
          if (value < 1) {
            value = value.toString().split("").slice(1).join("");
            value = "-$" + parseFloat(value).toFixed(2);
          } else {
            value = "$" + value.toFixed(2);
          }
        }
        else {
          value = "0";
        }
        return value;
      }
    }
  ]

  var t1 = Table(header, rows, {
    headerColor: "white",
    borderStyle: 2,
    borderColor: "white",
    paddingBottom: 0,
    headerAlign: "center",
    color: "white",
  });

  str1 = t1.render();
  console.log(str1);
};



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
      departments.department_id, 
      departments.department_name, 
      departments.over_head_costs,
      SUM(products.product_sales) AS 'product_sales',
      (SUM(products.product_sales) - departments.over_head_costs) AS 'total_profit'
    FROM 
      departments LEFT JOIN products 
    ON 
      departments.department_name = products.department_name
    GROUP BY 
      departments.department_id
  `,
    function (err, res) {
      if (err) throw err;
      formatTable(res);
      setTimeout(askQuestion, 1000);
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
      setTimeout(askQuestion, 1000);
    });
}
