var express = require("express");
var bcrypt = require("bcryptjs");
var session = require("express-session");
var sql = require("../db");
var router = express.Router();
// var jwt = require("jsonwebtoken");

// Bcrypt Functions
function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(7));
}
function checkPassword(password, dbPassword) {
  return bcrypt.compareSync(password, dbPassword);
}

// Route vers l'index
router.get("/", (req, res) => {
  res.status(200).render("index");
});

// Route vers l'index
router.get("/premium/", (req, res) => {
  res.status(200).render("premium");
});

// Page d'inscription
router.get("/users/inscription/", (req, res) => {
  res.status(200).render("login/inscription");
});

// Affichage de tous les etudiants
router.get("/users/all/etudiants", (req, res) => {
  req.sql.query("SELECT * FROM users WHERE isWhat = ?", ["etudiant"], (err, data) => {
    if (data.length >= 1) {
      delete data.password;
      res.status(200).render("users/etudiants", { users: data });
    } else {
      res.status(404).json({
        success: "false",
        errors: ["No users found in DataBase."]
      });
    }
  });
});

// Affichage de tous les professionnels
router.get("/users/all/professionnels", (req, res) => {
  req.sql.query("SELECT * FROM users WHERE isWhat = ?", ["professionnel"], (err, data) => {
    if (data.length >= 1) {
      delete data.password;
      res.status(200).render("users/etudiants", { users: data });
    } else {
      res.status(404).json({
        success: "false",
        errors: ["No users found in DataBase."]
      });
    }
  });
});

// Login
router.get("/users/login/", (req, res) => {
  res.status(200).render("login/connexion");
});

// Mon profil
router.get("/users/myProfile/:username", (req, res) => {
  sql.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) console.log(err);
    // Si il existe un exemplaire du username en BDD
    if (result.length == 1) {
      delete result[0].password;
      res.status(200).render("login/myProfile", { user: result[0] });
    } else {
      res.status(404).json({
        success: "false",
        errors: ["User not found in database."]
      });
    }
  });
});

// Chercher un utilisateur
router.get("/users/search/:username", (req, res) => {
  sql.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) console.log(err);
    // Si il existe un exemplaire du username en BDD
    if (result.length == 1) {
      delete result[0].password;
      res.status(200).render("users/user", { user: result[0] });
    } else {
      res.status(404).json({
        success: "false",
        errors: ["User not found in database."]
      });
    }
  });
});

//Modifier un profil
router.get("/modify/profile/:username", (req, res) => {
  sql.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) console.log(err);

    // Si il existe un exemplaire du username en BDD
    if (result.length == 1) {
      delete result[0].password;
      res.status(200).render("login/modifyMyProfile", { user: result[0] });
    } else {
      res.status(404).json({
        success: "false",
        errors: ["User not found in database."]
      });
    }
  });
});

module.exports = router;
