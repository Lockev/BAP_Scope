var express = require("express");
var bcrypt = require("bcryptjs");
var sql = require("../db");
var formidable = require("formidable");
var router = express.Router();
var validator = require("validator");
var session = require("express-session");

// Bcrypt Functions
function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(7));
}
function checkPassword(password, dbPassword) {
  return bcrypt.compareSync(password, dbPassword);
}

// Page d'inscription
router.post("/inscription/", (req, res) => {
  // Paramètres

  password = req.body.password;
  confirmPassword = req.body.confirmPassword;
  email = req.body.email.toLowerCase();
  username = req.body.username;
  biography = validator.escape(req.body.biography);
  firstName = req.body.firstName;
  lastName = req.body.lastName;
  city = req.body.city;
  codePostal = req.body.codePostal;
  age = req.body.age;
  job = req.body.job;
  isWhat = req.body.isEtudiant;
  profilePictureName = "defaultProfilePicture.jpg";

  // Validator;
  let validatorErreurs = {};
  if (!validator.isLength(password, { min: 5, max: 50 })) {
    validatorErreurs.password = "Password must have at least 5 characters, with a maximum of 50.";
  }
  if (!validator.isEmail(email)) {
    validatorErreurs.email = "Please enter a valid email.";
  }
  if (!validator.isLength(username, { min: 4, max: 25 })) {
    validatorErreurs.usernameLength = "Username must have at least 5 characters, with a maximum of 25.";
  }
  if (!validator.isAlphanumeric(username, "fr-FR")) {
    validatorErreurs.usernameInvalid = "You can only use Alphanumeric characters for usernames.";
  }
  if (!validator.isAlpha(firstName, "fr-FR")) {
    validatorErreurs.firstName = "Please enter a valid firstname.";
  }
  if (validator.isEmpty(firstName)) {
    validatorErreurs.firstName = "Please enter a valid firstname.";
  }
  if (!validator.isAlpha(lastName, "fr-FR")) {
    validatorErreurs.lastName = "Please enter a valid lastname.";
  }
  if (validator.isEmpty(lastName)) {
    validatorErreurs.lastName = "Please enter a valid lastname.";
  }
  if (!validator.isAlpha(city, "fr-FR")) {
    validatorErreurs.city = "Please enter a valid city.";
  }
  if (validator.isEmpty(city)) {
    validatorErreurs.city = "Please enter a valid city.";
  }
  if (!validator.isInt(codePostal)) {
    validatorErreurs.codePostal = "Please enter a valid postal code.";
  }
  if (validator.isEmpty(codePostal)) {
    validatorErreurs.codePostal = "Please enter a valid postal code.";
  }
  if (validator.isURL(biography)) {
    validatorErreurs.biographyLink = "Links are not allowed in your biography.";
  }
  if (isWhat !== "etudiant" && isWhat !== "professionnel") {
    console.log(isWhat);
    validatorErreurs.UserType = "You can only be an `etudiant` or a `professionnel`.";
  }
  if (age == undefined || age <= 13) {
    validatorErreurs.age = "You need to be 13 years old or older to register on Scope.";
  }

  if (Object.entries(validatorErreurs).length === 0) {
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
            "INSERT INTO users SET email = ?, username = ?, firstName = ?, lastName = ?, password = ?, biography = ?, age = ?, job = ?, isWhat = ?, city = ?, codePostal = ?, pathToProfilePicture = ?, isAdmin = ?, auth_Token = ?, auth_Token_Validity = ?",
            [email, username, firstName, lastName, hash, biography, age, job, isWhat, city, codePostal, profilePictureName, 0, "defaultToken", "0000-00-00"]
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
  } else {
    res.status(409).json({
      validatorErreurs
    });
  }
});

// Login
router.post("/login/", (req, res) => {
  // Paramètres
  password = req.body.password;
  email = req.body.email;

  // Validator;
  let validatorErreurs = {};
  if (!validator.isLength(password, { min: 5, max: 50 })) {
    validatorErreurs.password = "Password must have at least 5 characters, with a maximum of 50.";
  }
  if (!validator.isEmail(email)) {
    validatorErreurs.email = "Please enter a valid email.";
  }

  if (Object.entries(validatorErreurs).length === 0) {
    // Check que l'email est present en BDD
    sql.query("SELECT * FROM users WHERE email = ?", [email], (req, result) => {
      let user = [];
      result.map(ele => user.push(ele));

      // Si il existe un exemplaire de l'email en BDD
      if (user.length == 1) {
        // On vérifie que le mot de passe est le bon
        let check = checkPassword(password, user[0].password);
        if (check == true) {
          // Ajout des données dans la session
          session.connected = true;
          session.city = user[0].city;
          session.codePostal = user[0].codePostal;
          session.username = user[0].username;
          session.biography = user[0].biography;
          session.email = user[0].email;
          session.isWhat = user[0].isWhat;
          session.lastName = user[0].lastName;
          session.firstName = user[0].firstName;
          session.age = user[0].age;
          session.pathToProfilePicture = user[0].pathToProfilePicture;
          session.job = user[0].job;

          // On redirige l'utilisateur sur sa page perso
          res.status(200).redirect("/users/myProfile/" + user[0].username);
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
  } else {
    res.status(409).json({
      validatorErreurs
    });
  }
});

// Se déconnecter
router.get("/disconnect", (req, res) => {
  req.session.regenerate(function(err) {
    if (err) throw err;
    session.connected = false;
    session.city = "empty";
    session.codePostal = "empty";
    session.username = "empty";
    session.biography = "empty";
    session.email = "empty";
    session.isWhat = "empty";
    session.lastName = "empty";
    session.firstName = "empty";
    session.age = "empty";
    session.pathToProfilePicture = "empty";
    session.job = "empty";

    res.status(200).redirect("/users/login/");
  });
});

//Modifier un profil
router.post("/modify/profile/:username", (req, res) => {
  // Paramètres
  age = req.body.age;
  biography = req.body.biography;

  // Validator;
  let validatorErreurs = {};
  if (age == undefined || age <= 13) {
    validatorErreurs.age = "You need to be 13 years old or older to register on Scope.";
  }
  if (validator.isURL(biography)) {
    validatorErreurs.biographyLink = "Links are not allowed in your biography.";
  }
  if (Object.entries(validatorErreurs).length === 0) {
    // Traitement SQL
    sql.query("UPDATE users SET biography = ?, age = ? WHERE username = ?", [biography, age, req.params.username], (err, result) => {
      console.log(age);
      if (err) throw err;
      var user = result[0];
      res.redirect("/users/login/");
    });
  } else {
    res.status(409).json({
      validatorErreurs
    });
  }
});

// Modifier une PP
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
        res.redirect("/users/login/");
      } else {
        console.log("Canceled upload of " + file.name);
      }
    });
  });
});

module.exports = router;
