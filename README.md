# E-Commerce Inventory & Order Management System

## Overview

This project is a **full-stack e-commerce inventory and order management system** that allows administrators to manage products, Users, and orders while providing customers with a seamless shopping experience.

## Admin Features

### Product Management:

* **CRUD Operations:** Add, edit, update, and delete products **manually**.
* **API Integration:** Import external products automatically via **DummyJSON API**.
* **Data Integrity:** Prevent duplicate entries with **SKU checks**.

### Order Management:

* **Order Visibility:** View and manage **all customer orders**.
* **Status Updates:** Update order statuses (e.g., Pending, Shipped, Delivered).

### User Management:

* **Customer View:** View a list of registered customers.
* **Admin Security:** Securely manage admin credentials using **hashed passwords** (bcrypt).

### Data Export:

* **Reporting:** Export product and order data to **CSV or PDF** for detailed reporting.

### Analytics & Visualization:

* **Interactive Charts:** View sales and inventory trends via **interactive charts (Chart.js)**.

### Security & Session Management:

* **Access Control:** **Role-based access** using **JWT** (JSON Web Tokens).
* **Protection:** Prevent unauthorized access to sensitive admin pages.

## Customer Features

### User Registration & Login:

* **Secure Registration:** Secure account creation with **hashed passwords**.
* **Authentication:** Login with **JWT-based session management**.

### Product Browsing:

* **Filtering:** View products by category using the **filter functionality**.
* **Details:** See product details including **price, description, and stock availability**.

### Shopping Cart:

* **Management:** Add products to cart.
* **Editing:** Update quantity or remove items from the cart.

### Order Placement:

* **Ordering:** Place orders for selected products.
* **History:** View **order history** and detailed order information.

### Responsive UI:

* **Navigation:** Easy-to-navigate product listings.
* **UX/UI:** Interactive and **user-friendly front-end pages**.

### Secure Experience:

* **Authorization:** **Session and role-based security** prevents unauthorized access to admin features.

## Technologies Used

* **Frontend:** HTML, CSS, JavaScript, Bootstrap, Chart.js
* **Backend:** Node.js, Express.js, `axios` (DummyJSON API requests), `jsonwebtoken` (JWT), `bcrypt`, `express-session`, `helmet`, `express-validator`, `multer`
* **Database:** MySQL (`mysql2`)
* **Utilities & Others:** `body-parser`, `cors`, `dotenv`, `json2csv`, `pdfkit`, `nodemon`
* **External Integration:** DummyJSON API

## Setup & Installation

### 1. Clone the Repository

```
git clone https://github.com/Khushi-Patel-code/E-Commerce-Inventory-Order-Management-System-Website
cd E-Commerce-Inventory-Order-Management-System-Website
git pull origin main
```
### 2. Install Dependencies

Run the following commands to install all required packages:

```
npm install jsonwebtoken bcrypt axios
npm install express mysql2 body-parser cors dotenv ejs chart.js
npm install nodemon --save-dev
npm install express-session json2csv pdfkit helmet express-validator multer connect
```

### 3. Setup Database

* Make sure **MySQL Workbench** is open and run all provided **SQL files**.
* Update your database connection details in `db/connection.js`.
* Ensure `.env` file variables match your database configuration:
    * `DB_HOST` → `localhost`
    * `DB_USER` → `root`
    * `DB_PASS` or `DB_PASSWORD` must match across `.env` and `connection.js`.
    * **Important:** Do not include `#` in your MySQL password. If necessary, enclose the password in double quotes.

### 4. Run the Application

```
npm run dev   # for development mode
# OR
npm start     # for production mode
```

### 5. Admin Login Setup

There is no admin creation page. To create a new admin password:

1.  Run the hash generation script:
    ```bash
    node generate-hash.js
    ```
2.  Copy the generated hash and update the admin user in your SQL file or directly in the database:
    ```sql
    UPDATE users
    SET password_hash = 'paste-generated-hash-here'
    WHERE email = 'khushi.patel@example.com';
    ```
3.  Re-run the SQL scripts (if modifying the file) and log in with the plaintext password you set in `generate-hash.js`.
## Usage

### 1. Access the Website

* Open your browser and navigate to the local server (default: `http://localhost:3000`).
* **Note:** Use **separate browsers** or **incognito mode** for admin and customer testing to avoid JWT session conflicts.

### 2. Admin Panel

* Log in using the admin credentials (set up via `generate-hash.js` as described in **Setup & Installation**).
* **Manage** products, orders, and users.
* **Fetch external products** via the integrated API.
* **Generate reports** in CSV or PDF format using the export functionality.
* **Monitor dashboard charts** for inventory and order statistics.

### 3. Customer Panel

* Register or log in with a customer account.
* **Browse products** by category and search for specific items.
* **Add products to cart** and place orders.
* **View past orders** and order statuses.

### 4. Additional Notes

* Ensure the **database is running** before accessing the website.
* Changes made in the admin panel (like adding products or categories) are **immediately reflected** on the customer side.
* For testing purposes, **multiple customer accounts** can be created to simulate real-world usage.

---
---
---
**Install These first**

`npm install jsonwebtoken`
`npm install bcrypt`
`npm install axios`

`npm install express mysql2 body-parser cors dotenv ejs`
`npm install chart.js`
`npm install nodemon --save-dev`

`npm install express-session bcrypt json2csv pdfkit helmet express-validator multer connect`

**Additional:**
Make sure that your workbench is open and you are running all sql files. Then in terminal:

`npm run dev` or `npm start`

**IMPORTANT!!!!!!!!!!!!!!**

Furthermore, ensure your .env file and connection.js files are properly configured (make sure the port you're running your database on is the same as what's on the.env and connection.js file). Your DB_HOST and DB_USER should be localhost and root respectively unless otherwise stated. If your password variable is DB_PASS or DB_PASSWORD, whatever it's called in one file, it has to be the same when it's called in the other. 

PLEASE DO NOT INCLUDE '#' IN YOUR MySQL PASSWORD. IT WILL NOT BE READ AND DEVELOPERS WILL SCRATCH THEIR HEADS TRYING TO FIND OUT WHY YOUR REGISTRATION IS FAILING. IN THE EVENT YOU HAVE '#' IN YOUR PASSWORD, ENCLOSE YOUR PASSWORD IN DOUBLE QUOTES FOR IT TO BE READ AS A STRING. Login and account creation should now work.

Also, if you intend on testing admin and customer sides at the same time, it is highly recommended to have the customer pages on one browser and the admin on a seperate browser (i.e. Chrome and Firefox) to avoid conflict in JWT session role ids.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**ADMIN LOGIN TESTING**

For the admin side, please run the generate-hash.js file located in the root directory first `node generate-hash.js`. As there is no creation page for new admins, you need to create a new password and generate the hash for it. At the bottom of the sample values sql file, if it is not there already, add this query and paste the generated hash from your terminal:

UPDATE users

SET password_hash = 'Insert new hash from terminal here'

WHERE email = 'jayden.mallari@example.com';

Rerun all of the SQL scripts, and login with the mentioned email (jayden.mallari@example.com) and the plaintext password set in the generate-hash.js file (jay1234).

------------------------------------------------------------------------------------------------------------------------------------------------------------------------

for converting a json to csv/pdf download the following libraries:
`npm install json2csv pdfkit`

cloning intsructions

`git clone https://github.com/Khushi-Patel-code/E-Commerce-Inventory-Order-Management-System-Website`

`cd E-Commerce-Inventory-Order-Management-System-Website/`

`git pull origin main`


pushing instructions

to add all changes in file
`git add .` 

`git commit -m "Commit message here"`

`git push origin main`










