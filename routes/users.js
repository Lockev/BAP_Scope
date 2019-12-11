var bcrypt = require("bcrypt-nodejs");
var jwt = require("jsonwebtoken");
var controls = require("../controllers/usersCtrl");
const { check } = require("express-validator");

// Routes
module.exports = {
  register: function(req, res) {
    app.post(
      "/users/register/",
      [
        check("email")
          .isEmail()
          .normalizeEmail()
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
          .withMessage("Password must have more than 6 characters."),
        check("bio")
          .not()
          .isEmpty()
          .withMessage("Bio must not be empty.")
      ],
      (req, res) => {
        // On vérifie que l'email et le username sont unique
        req.sql.query("SELECT * FROM users WHERE username='" + req.body.username + "'", [req.body.username], (error, result) => {
          let nameFound = [];
          result.map(ele => nameFound.push(ele));

          // controls.getAllUsers();

          if (nameFound[0] == undefined) {
            bcryptedPassword = bcrypt.hash(req.body.password, 7, (err, res) => {
              req.sql.query(
                "INSERT INTO users SET email = ?, username = ?, password = ?, bio = ?",
                [req.body.name, req.body.contact, bcryptedPassword, req.body.bio],
                (error, result) => {
                  var jsonSent = {
                    success: "true",
                    status: "201"
                  };
                  res.status(201).json({ jsonSent });
                }
              );
            });
          } else {
            var jsonSent = {
              success: "false",
              status: "409",
              error: ["Email already used."]
            };
            res.status(409).json({ jsonSent });
          }
        });
      }
    );
  },
  login: function(req, res) {
    // bcrypt.compare('somePassword', hash, function(err, res) {
    //   if(res) {
    //    // Passwords match
    //   } else {
    //    // Passwords don't match
    //   }
    // });
  }
};
