const app = require("./app");
const dotenv = require("dotenv");
const database = require("./config/database");

// Load environment variables
dotenv.config();

// Load database
database();





// Start server

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});

server.setTimeout(120000); // 2-minute timeout