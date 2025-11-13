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

Furthermore, ensure your .env file and connection.js files are properly configured your DB_HOST and DB_USER should be localhost and root respectively unless otherwise stated. If your password variable is DB_PASS or DB_PASSWORD, whatever it's called in one file, it has to be the same when it's called in the other. PLEASE DO NOT INCLUDE A '#' IN YOUR PASSWORD. IT WILL NOT BE READ AND DEVELOPERS WILL SCRATCH THEIR HEADS TRYING TO FIND OUT WHY YOUR REGISTRATION IS FAILING. IN THE EVENT YOU HAVE '#' IN YOUR PASSWORD, ENCLOSE YOUR PASSWORD IN DOUBLE QUOTES FOR IT TO BE READ AS A STRING. Then go to index.html and run the page live. It should work.

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


