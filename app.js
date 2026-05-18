require("dotenv").config();
const express = require("express");
const cors = require('cors');
const {router:UserRouter} = require("./server/route/userHandler");
const AdminRouter = require("./server/route/adminHandler");
const PostRouter = require("./server/route/postHandler");
const recoveryRouter = require("./server/route/passwordRecoveryHandler");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load('./swagger.yaml');
const logger = require('./logger'); // Import your config
const cookieParser = require("cookie-parser");
const app = express();

const PORT =  process.env.PORT || 3000 ;

app.use(express.json());
app.use(cookieParser());
app.use("/users", UserRouter);
app.use("/admin", AdminRouter);
app.use("/posts", PostRouter);
app.use("/pass-recover",recoveryRouter)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.static("public"));
app.get('/', (req, res) => {
  logger.info('Home page was accessed'); // Info level
  res.send('Hello World');
});

// app.get('/error', (req, res) => { //testing for logger
//   try {
//     throw new Error('Database connection failed!');
//   } catch (err) {
//     logger.error(err.message); // Error level
//     res.status(500).send('Something went wrong');
//   }
// });
//===========error handling middleware============
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message} - ${req.method} ${req.url}`);
  
  res.status(500).send('A server error occurred.');
});
app.listen(PORT, () => {
	console.log(`app is listening on port ${PORT}`);
	console.log("Swagger Docs: http://localhost:3000/api-docs");
});
