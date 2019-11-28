var sql = require("../db");
const TABLE = "events";

exports.getAllEvents = req => {
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

exports.getEvent = req => {
  console.log("getEvent");
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM " + TABLE + " WHERE id = ?", [req.params.id], function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

exports.addEvent = req => {
  console.log("addEvent");
  const date = new Date();
  const newEvent = [
    {
      title: req.body.title,
      description: req.body.description,
      created_at: date,
      updated_at: date
    }
  ];
  return new Promise((resolve, reject) => {
    sql.query("INSERT INTO " + TABLE + " set ?", newEvent, function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

exports.updateEvent = req => {
  console.log("updateEvent");
  const updateEventData = [req.body.title, req.body.description, new Date(), req.params.id];
  return new Promise((resolve, reject) => {
    sql.query("UPDATE " + TABLE + " set title = ?, description = ?, updated_at = ? WHERE id = ?", updateEventData, function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

exports.deleteEvent = req => {
  console.log("deleteEvent");
  return new Promise((resolve, reject) => {
    sql.query("DELETE FROM " + TABLE + " WHERE id = ?", [req.params.id], function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};
