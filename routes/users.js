var express = require("express");
const { check, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
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

// Register
router.post(
  "/register/",
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
      confirmPassword = req.body.confirmPassword;
      email = req.body.email.toLowerCase();
      username = req.body.username;
      biography = req.body.biography;
      firstName = req.body.firstName;
      lastName = req.body.lastName;
      age = req.body.age;
      pathToProfilePicture = firstName + "-" + lastName + "-" + username;

      if (confirmPassword === password) {
        // Check que l'email n'est pas deja present en BDD
        sql.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], (err, result) => {
          let emailFound = [];
          result.map(ele => emailFound.push(ele));

          // Si l'email et le username n'existent pas en BDD
          if (emailFound[0] == undefined) {
            hash = generateHash(password);
            // Traitement SQL
            sql.query(
              "INSERT INTO users SET email = ?, username = ?, firstName = ?, lastName = ?, password = ?, biography = ?, age = ?, isWhat = ?, pathToProfilePicture = ?, isAdmin = ?, auth_Token = ?, auth_Token_Validity = ?",
              [email, username, firstName, lastName, hash, biography, age, "Etudiant", pathToProfilePicture, 0, "defaultToken", "0000-00-00"]
            );

            res.status(200).json("User succesfully added to database.");
          } else {
            res.status(409).json({
              success: "false",
              errors: ["Email or Username already in database."]
            });
          }
        });
      } else {
        res.status(409).json({
          success: "false",
          errors: ["Passwords does not match."]
        });
      }
    }
  }
);

// Infos de tous les users
router.get("/all/", (req, res) => {
  req.sql.query("SELECT * FROM users", (err, data) => {
    res.json({
      data: data,
      errors: err
    });
  });
});

// Get one user
router.get(
  "/login/",
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
            delete user[0].password;
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

router.get("/search/:username", (req, res) => {
  sql.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) console.log(err);

    // Si il existe un exemplaire du username en BDD
    if (result.length == 1) {
      delete result[0].password;
      res.render("user", { user: result[0] });
    } else {
      res.status(404).json({
        success: "false",
        errors: ["User not found in database."]
      });
    }
  });
});

module.exports = router;

// On ajoute des paranthèses pour instancier la fonction
