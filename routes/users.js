var express = require("express");
const { check, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var sql = require("../db");
var jwt = require("jsonwebtoken");

// Router
exports.router = (function() {
  var apiRouter = express.Router();

  // Users routes
  apiRouter.post(
    "/users/register/",
    // Conditions
    [
      check("email")
        .isEmail()
        .withMessage("Email should not be empty."),
      check("username")
        .not()
        .isEmpty()
        .isLength({ min: 5, max: 25 })
        .withMessage("Username must have more than 5 characters and less than 25."),
      check("password")
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must have more than 6 characters.")
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(500).json(s);
        return;
      } else {
        // Paramètres
        passwordEntered = req.body.password;
        email = req.body.email;
        username = req.body.username;
        biography = req.body.bio;

        // Check que l'email n'est pas deja present en BDD
        sql.query("SELECT * FROM users WHERE email = ?", email, (req, result) => {
          let emailFound = [];
          result.map(ele => emailFound.push(ele));

          // Si l'email n'existe pas en BDD
          if (emailFound[0] == undefined) {
            bcrypt.hash(passwordEntered, 7).then(hash => {
              // Traitement SQL
              sql.query("INSERT INTO users SET email = ?, username = ?, password = ?, biography = ?, isAdmin = ?", [
                email,
                username,
                hash,
                biography,
                0
              ]);
            });
            res.status(200).json("User succesfully added to database.");
          } else {
            res.status(409).json({
              success: "false",
              status: "409",
              errors: ["Email already in database."]
            });
          }
        });
      }
    }
  );

  apiRouter.get("/users/all/", (req, res) => {
    req.sql.query("SELECT * FROM users", (error, result) => {
      let data = [];
      result.map(ele => data.push(ele));
      res.json({
        data: data,
        errors: error
      });
    });
  });

  apiRouter.get("/users/login/", (req, res) => {
    email = req.body.email;
    password = req.body.password;
    bcrypt.hash(passwordEntered, 7).then(hash => {
      // Traitement SQL
      sql.query("SELECT * FROM users WHERE email = ?, password = ?", [email, hash], (error, result) => {
        let data = [];
        result.map(ele => data.push(ele));
        res.json({
          data: data,
          errors: error
        });
      });
    });
  });

  return apiRouter;
})();
// On ajoute des paranthèses pour instancier la fonction
