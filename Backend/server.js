const app = require("./app");

const dotenv = require("dotenv");
const cors  = require('cors');
const connectDatabase = require("./database/Database.js");

// const connectDatabase = require("./db/Database.js");
// const cloudinary = require("cloudinary");

// Handling uncaught Exception
process.on("uncaughtException",(err) =>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server for Handling uncaught Exception`);
})

// config
dotenv.config({
    path:"Backend/config/.env"
})
connectDatabase();

app.use(cors());


const server = app.listen(process.env.PORT,() =>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})

console.log(i8j);

// Unhandled promise rejection
process.on("unhandledRejection", (err) =>{
    console.log(`Shutting down server for ${err.message}`);
    console.log(`Shutting down the server due to Unhandled promise rejection`);
    server.close(() =>{
        process.exit(1);
    });
});
