# Bamazon App

Bamazon is an Amazon-like storefront terminal application with MySQL database. It takes orders from users and update the store's inventory in the database! There're also some features for a store manager to track and overview the product sales. 

## Customer View

The command ```node bamazonCustomer.js``` will show you the product list which is formatted with tty-table package. A user can order an item by entering the SKU number and the quantity. Once the purchase is complete, the app will update the inventory in the database.

![gif](https://github.com/yukanishijima/mysql-storefront-app/blob/master/images/bamazonCustomer-demo.gif/)  

## Manager View

A store manager can use the command ```node bamazonManager.js``` to do the following.

- View a list of available items (the item IDs, names, prices and quantities).  
- View all items with an inventory count lower than five.  
- Replenish any item currently in the store.  
- Add a completely new item to the store.

![gif](https://github.com/yukanishijima/mysql-storefront-app/blob/master/images/bamazonManager-demo.gif/)  


## Supervisor View

If you're a supervisor, you can view a summarized table of product sales and total profit by department with the command line ```node bamazonSupervisor.js```.  

The total profit is not stored in the database and will be calculated on the fly using the difference between the over head costs and product sales for each department. 

![gif](https://github.com/yukanishijima/mysql-storefront-app/blob/master/images/bamazonSupervisor-demo.gif/)  

## Technologies & Resources
```
- Javascript
- Node.js
- npm
 - dotenv
 - tty-table
 - inquirer
- MySQL
```

## Note

In order to use Bamazon App, you need to use your own password for MySQL database. Please creat a file named .env, add the follwoing to it, and replace the values with your password.

PASSWORD="your-password"