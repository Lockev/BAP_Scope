var express = require("express");
var path = require("path");
var sql = require("./db");
var bodyParser = require("body-parser");

var apiRouter = require("./routes/api");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Make our db accessible to our router
app.use(function(req, res, next) {
  req.sql = sql;
  next();
});

// views as directory for all template files
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); // use ejs
// instruct express to server up static assets
app.use(express.static("public"));

var version = "/api/v1/";
// Apply Routes to App
// All of these routes will be prefixed with /api/v1/
app.use(version + "events", apiRouter);

var testRouter = require("./routes/test");
app.use("/test", testRouter);

// non api route for our views
app.get("/", (req, res) => {
  res.render("index");
});

// Better way to disable x-powered-by
app.disable("x-powered-by");

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Send 404 if page not found
app.get("*", function(req, res) {
  res.status(404).render("404");
});

module.exports = app;
