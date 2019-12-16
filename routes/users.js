var express = require("express");
const { check, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var sql = require("../db");
var jwt = require("jsonwebtoken");

// Bcrypt Functions
function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(7));
}
function checkPassword(password, dbPassword) {
  return bcrypt.compareSync(password, dbPassword);
}

// JWT Token vérification
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["Authorization"];
  // Vérifie si le bearerHeader n'existe pas deja
  if (typeof bearerHeader !== "undifined") {
    // Récupère le token depuis le header "authorization"
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    // Renvoie le token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Interdit
    res.sendStatus(403);
  }
}
// JWT SecretKey
secretKeyJWT = "K9inc5e2oP82pAP86218LJKcv8";

// Router
exports.router = (function() {
  var apiRouter = express.Router();

  // Register
  apiRouter.post(
    "/users/register/",
    // Conditions
    [
      check("email")
        .not()
        .isEmpty()
        .withMessage("empty email.")
        .isEmail()
        .withMessage("Please enter a valid email."),
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
        password = req.body.password;
        email = req.body.email;
        username = req.body.username;
        biography = req.body.bio;

        // Check que l'email n'est pas deja present en BDD
        sql.query("SELECT * FROM users WHERE email = ?", email, (req, result) => {
          let emailFound = [];
          result.map(ele => emailFound.push(ele));

          // Si l'email n'existe pas en BDD
          if (emailFound[0] == undefined) {
            hash = generateHash(password);
            // Traitement SQL
            sql.query(
              "INSERT INTO users SET email = ?, username = ?, password = ?, biography = ?, isAdmin = ?, auth_Token = ?, auth_Token_Validity = ?",
              [email, username, hash, biography, 0, "defaultToken", "0000-00-00"]
            );

            res.status(200).json("User succesfully added to database.");
          } else {
            res.status(409).json({
              success: "false",
              errors: ["Email already in database."]
            });
          }
        });
      }
    }
  );

  // Fetch all Users
  apiRouter.get("/users/all/", (req, res) => {
    // jwt.verify(req.token, secretKeyJWT, (err, authData) => {
    //   if (err) {
    //     res.sendStatus(403);
    //   } else {
    req.sql.query("SELECT * FROM users", (error, result) => {
      let data = [];
      result.map(ele => data.push(ele));
      res.json({
        data: data,
        errors: error
      });
    });
    //   }
    // });
  });

  apiRouter.post("/token/check/", (req, res) => {
    const user = {
      id: 1,
      name: "karl",
      email: "karl@gegmail.com"
    };
    jwt.sign({ user }),
      secretKeyJWT,
      // { expiresIn: "1h" },
      (err, token) => {
        res.json({
          token
        });
      };
  });

  // Get one user
  apiRouter.get(
    "/users/login/",
    // Conditions
    [
      check("email")
        .isEmail()
        .withMessage("Please enter a valid Email."),
      check("password")
        .not()
        .isEmpty()
        .withMessage("Please enter a password.")
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(500).json(errors);
        return;
      } else {
        // Paramètres
        password = req.body.password;
        email = req.body.email;

        // Check que l'email est present en BDD
        sql.query("SELECT * FROM users WHERE email = ?", [email], (req, result) => {
          let user = [];
          result.map(ele => user.push(ele));

          // Si il existe un exemplaire de l'email en BDD
          if (user.length == 1) {
            let check = checkPassword(password, user[0].password);
            if (check == true) {
              res.status(200).json({
                success: "true",
                data: user[0],
                errors: []
              });
            } else {
              res.status(404).json({
                success: "false",
                errors: ["Password not matching."]
              });
            }
          } else {
            res.status(404).json({
              success: "false",
              errors: ["Email not found in database."]
            });
          }
        });
      }
    }
  );

  return apiRouter;
})();
// On ajoute des paranthèses pour instancier la fonction
