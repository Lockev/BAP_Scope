var express = require("express");
var bcrypt = require("bcryptjs");
var session = require("express-session");
var sql = require("../db");
var formidable = require("formidable");
var router = express.Router();
// var jwt = require("jsonwebtoken");

// Bcrypt Functions
function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(7));
}
function checkPassword(password, dbPassword) {
  return bcrypt.compareSync(password, dbPassword);
}

// Page d'inscription
router.post(
  "/inscription/",
  // Conditions
  // HEDDI DELETE
  (req, res) => {
    // Paramètres

    password = req.body.password;
    confirmPassword = req.body.confirmPassword;
    email = req.body.email.toLowerCase();
    username = req.body.username;
    biography = req.body.biography;
    firstName = req.body.firstName;
    lastName = req.body.lastName;
    age = req.body.age;
    job = req.body.job;
    isWhat = req.body.isEtudiant;
    profilePictureName = "defaultProfilePicture.jpg";

    if (confirmPassword === password) {
      // Check que l'email n'est pas deja present en BDD
      sql.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], (err, result) => {
        let userFound = [];
        result.map(ele => userFound.push(ele));

        // Si l'email et le username n'existent pas en BDD
        if (userFound[0] == undefined) {
          hash = generateHash(password);

          // Traitement SQL
          sql.query(
            "INSERT INTO users SET email = ?, username = ?, firstName = ?, lastName = ?, password = ?, biography = ?, age = ?, job = ?, isWhat = ?, pathToProfilePicture = ?, isAdmin = ?, auth_Token = ?, auth_Token_Validity = ?",
            [email, username, firstName, lastName, hash, biography, age, job, isWhat, profilePictureName, 0, "defaultToken", "0000-00-00"]
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
);

// Login
router.post(
  "/login/",
  // Conditions
  // HEDDI DELETE
  (req, res) => {
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
          res.status(200).render("login/myProfile", { user: user[0] });
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
);

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
router.post("/modify/profile/:username", (req, res) => {
  // Paramètres

  firstName = req.body.firstName;
  lastName = req.body.lastName;
  age = req.body.age;
  biography = req.body.biography;
  username = req.params.username;

  // Traitement SQL
  sql.query(
    "UPDATE users SET firstName = ?, lastName = ?, biography = ?, age = ? WHERE username = ?",
    [firstName, lastName, biography, age, req.params.username],
    (err, result) => {
      if (err) throw err;
      var user = result[0];
      res.redirect("../../login/");
    }
  );
});

// Modifier une PP
router.get("/modify/profilePicture/:username", (req, res) => {
  res.status(200).render("login/modifyMyPP");
});

router.post("/modify/profilePicture/:username", (req, res) => {
  sql.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) throw err;
    var user = result[0];

    var form = new formidable.IncomingForm();

    form.parse(req);
    isUploaded = false;

    form.on("fileBegin", function(name, file) {
      var fileType = file.type.split("/").pop();
      if (fileType == "jpg" || fileType == "png" || fileType == "jpeg") {
        // Changement du nom de l'image
        file.name = user.firstName + "-" + user.lastName + "-" + user.username + "." + fileType;
        file.path = __dirname + "/../public/img/profilePictures/" + file.name;
        isUploaded = true;
        // Changement du path vers la phtoto de profil en BDD
        sql.query("UPDATE users SET pathToProfilePicture = ? WHERE username = ?", [file.name, req.params.username], (err, result) => {
          if (err) throw err;
        });
      } else {
        res.status(405).json({
          error: "This file cannot be uploaded."
        });
      }
    });

    form.on("file", function(name, file) {
      if (isUploaded == true) {
        console.log("Uploaded " + file.name);
        res.redirect("../../login/");
      } else {
        console.log("Canceled upload of " + file.name);
      }
    });
  });
});

module.exports = router;
