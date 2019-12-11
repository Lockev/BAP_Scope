var express = require("express");
var usersCtrl = require("./routes/users");

// Router
exports.router = (function() {
  var apiRouter = express.Router();

  // Users routes
  apiRouter.route("/users/register/").post(usersCtrl.register);
  apiRouter.route("/users/login/").post(usersCtrl.login);

  // Other routes
  return apiRouter;
})();
// On ajoute des paranthèses pour instancier la fonction
