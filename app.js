const express = require("express");
const cors = require("cors");
const logger = require("./src/middleware/logger");
const cookieParser = require("cookie-parser");
const verifyJWT = require("./src/middleware/verifyJWT");
const { errorHandler, notFound } = require("./src/middleware/errorHandler");
const auth = require("./src/routes/authRoute");
const blogPost = require("./src/routes/postRoute");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: 'https://node-blog-api-n5uy.onrender.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


app.use(logger);

// For handling formdata
app.use(express.urlencoded({ extended: false }));

// Built in middleware for handling json data
app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send("From Backend");
});

// authentication route
app.use("/api/auth", auth);

// routes that succeeds this middleware are authenticated routes
app.use(verifyJWT);

// blog posts routes(which are authenticated routes)
app.use("/api", blogPost);

// error handling middleware
app.use(errorHandler);
app.use(notFound);

app.listen(process.env.PORT, (err) => {
  if (err) throw err;
  console.log("Listening on port " + process.env.PORT);
});
