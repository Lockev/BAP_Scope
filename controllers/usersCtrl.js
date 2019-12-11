var sql = require("../db");
const TABLE = "users";

exports.getAllUsers = req => {
  console.log("getAllEvents");
  return new Promise((resolve, reject) => {
    var limit = req.body.limit ? "LIMIT " + req.body.limit : "";
    sql.query("SELECT * FROM " + TABLE + " " + limit, function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

// exports.getUser = req => {
//   console.log("getEvent");
//   return new Promise((resolve, reject) => {
//     sql.query("SELECT * FROM " + TABLE + " WHERE id = ?", [req.params.id], function(error, data) {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };