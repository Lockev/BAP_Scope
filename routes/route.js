var express = require("express");
var sql = require("../db");
var router = express.Router();
var session = require("express-session");

// Route vers l'index
router.get("/", (req, res) => {
  if (session.username !== undefined) {
    req.session.reload(function(err) {
      if (err) throw err;
      res.status(200).render("index", { session: session });
    });
  } else {
    res.status(200).render("index", { session: "empty" });
  }
});

// Route vers le premium
router.get("/premium/", (req, res) => {
  if (session.username !== undefined) {
    req.session.reload(function(err) {
      if (err) throw err;
      res.status(200).render("premium", { session: session });
    });
  } else {
    res.status(200).render("premium", { session: "empty" });
  }
});

// Page d'inscription
router.get("/users/inscription/", (req, res) => {
  req.session.regenerate(function(err) {
    res.status(200).render("login/inscription", { session: "empty" });
  });
});

// Affichage de tous les etudiants
router.get("/users/all/etudiants", (req, res) => {
  req.sql.query("SELECT * FROM users WHERE isWhat = ?", ["etudiant"], (err, data) => {
    if (data.length >= 1) {
      if (session.username !== undefined) {
        req.session.reload(function(err) {
          if (err) throw err;
          delete data.password;
          res.status(200).render("users/etudiants", { users: data, session: session });
        });
      } else {
        delete data.password;
        res.status(200).render("users/etudiants", { users: data, session: "empty" });
      }
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
      if (session.username !== undefined) {
        req.session.reload(function(err) {
          if (err) throw err;
          delete data.password;
          res.status(200).render("users/etudiants", { users: data, session: session });
        });
      } else {
        delete data.password;
        res.status(200).render("users/etudiants", { users: data, session: "empty" });
      }
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
  req.session.regenerate(function(err) {
    res.status(200).render("login/connexion", { session: "empty" });
  });
});

// Mon profil
router.get("/users/myProfile/:username", (req, res) => {
  sql.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) console.log(err);
    // Si il existe un exemplaire du username en BDD
    if (result.length == 1) {
      delete result[0].password;
      req.session.save(function(err) {
        if (err) throw err;
        if (result[0].username == session.username) {
          res.status(200).render("login/myProfile", { session: session });
        } else {
          res.status(200).redirect("/users/search/" + result[0].username);
        }
      });
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
      if (session.username !== undefined) {
        req.session.reload(function(err) {
          if (err) throw err;
          delete result[0].password;
          res.status(200).render("users/user", { user: result[0], session: session });
        });
      } else {
        delete result[0].password;
        res.status(200).render("users/user", { user: result[0], session: "empty" });
      }
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
      if (session.username !== undefined) {
        req.session.reload(function(err) {
          if (err) throw err;
          delete result[0].password;
          res.status(200).render("login/modifyMyProfile", { user: result[0], session: session });
        });
      } else {
        delete result[0].password;
        res.status(200).render("users/user", { user: result[0], session: "empty" });
      }
    } else {
      res.status(404).json({
        success: "false",
        errors: ["User not found in database."]
      });
    }
  });
});

module.exports = router;
