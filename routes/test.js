var express = require("express");
const { check, validationResult } = require("express-validator");
var router = express.Router();

router.get("/", function(req, res) {
  req.sql.query("SELECT * FROM events", function(error, data) {
    resp_data = {};
    resp_data.result = data;
    res.json(resp_data);
  });
});

router.get("/truc", function(req, res) {
  res.render("truc");
});

router.post("/", function(req, res) {
  req.sql.query("INSERT INTO event SET title = ?, description = ?", [req.body.title, req.body.description], function(error, data) {
    req.sql.query("SELECT * FROM events WHERE id = ?", [data.insertId], function(error, data) {
      resp_data = {};
      resp_data.result = data;
      res.json(resp_data);
    });
  });
});

module.exports = router;
