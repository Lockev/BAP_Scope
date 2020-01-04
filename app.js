var express = require("express");
var path = require("path");
var sql = require("./db");
var bodyParser = require("body-parser");
var userRouter = require("./routes/users");

var app = express();

// Configuration de BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rendre la BDD accessible au routeur
app.use(function(req, res, next) {
  req.sql = sql;
  next();
});

// On definit ejs en tant que randerer des templates
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// On dit à Express que les assets static sont dans le dossier "public"
app.use(express.static("public"));

// Toutes les routes de userRouter auront le prefixe "/api/users/"
app.use("/api/users/", userRouter);

// Route vers l'index
app.get("/", (req, res) => {
  res.status(200).render("index");
});

// Désactivation de x-powered-by
app.disable("x-powered-by");

// Au cas où : L'error handeling
app.use(function(err, req, res, next) {
  // Erreurs uniquement disponibles dans un environnement de développement
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Rendu de la page d'erreur
  res.status(err.status || 500);
  res.render("An error occured, please refresh the page or <a href='/'>click here</a>.");
});

// Pour toutes les autres routes : Erreur 404
app.get("*", function(req, res) {
  res.status(404).render("errors/404");
});

module.exports = app;
