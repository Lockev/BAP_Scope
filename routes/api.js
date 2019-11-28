const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const eventsController = require("../controllers/api");

var response_format = {
  success: "",
  status: "",
  data: [],
  error: []
};

function extractErrorMessages(error) {
  return error.map(a => a.msg);
}

function setResponse(status = 404, error = null, data = null) {
  if (error) {
    return {
      ...response_format,
      status,
      error: status === 422 ? extractErrorMessages(error) : error,
      data: [],
      success: false
    };
  } else {
    return {
      ...response_format,
      status,
      data,
      success: true
    };
  }
}

function validate(method) {
  switch (method) {
    case "POST": {
      return [
        check("title")
          .not()
          .isEmpty()
          .trim()
          .escape()
          .withMessage("Title should not be empty"),
        check("description")
          .not()
          .isEmpty()
          .trim()
          .escape()
          .withMessage("Description should not be empty")
      ];
    }
    case "PUT": {
      return [
        check("id")
          .not()
          .isEmpty()
          .isNumeric(),
        check("title")
          .not()
          .isEmpty()
          .trim()
          .escape()
          .withMessage("Title should not be empty"),
        check("description")
          .not()
          .isEmpty()
          .trim()
          .escape()
          .withMessage("Description should not be empty")
      ];
    }
  }
}

router.get("/", function(req, res) {
  var status = 500;
  var resp_format = {};

  eventsController.getAllEvents(req, function(error, data) {
    if (!error) {
      status = 200;
    }
    console.log(status);
    resp_format = setResponse(status, error, data);
    return res.status(status).json(resp_format);
  });
});

router.get("/:id", function(req, res) {
  var status = 500;
  var resp_format = {};

  eventsController.getEvent(req, function(error, data) {
    if (!error) {
      status = 200;
    }
    resp_format = setResponse(status, error, data);
    return res.status(status).json(resp_format);
  });
});

router.post("/", validate("POST"), function(req, res) {
  var status = 500;
  var resp_format = {};

  const err = validationResult(req);

  if (!err.isEmpty()) {
    status = 422;
    resp_format = setResponse(status, err.array(), []);
    return res.status(status).json(resp_format);
  } else {
    eventsController.addEvent(req, function(error, data) {
      if (!error) {
        status = 200;
      }
      resp_format = setResponse(status, error, data);
      return res.status(status).json(resp_format);
    });
  }
});

router.put("/:id", validate("PUT"), function(req, res) {
  var status = 500;
  var resp_format = {};

  const err = validationResult(req);

  if (!err.isEmpty()) {
    status = 422;
    resp_format = setResponse(status, err.array(), []);
    return res.status(status).json(resp_format);
  } else {
    eventsController.updateEvent(req, function(error, data) {
      if (!error) {
        status = 200;
      }
      resp_format = setResponse(status, error, data);
      return res.status(status).json(resp_format);
    });
  }
});

router.delete("/:id", function(req, res) {
  var status = 500;
  var resp_format = {};

  eventsController.deleteEvent(req, function(error, data) {
    if (!error) {
      status = 200;
    }
    resp_format = setResponse(status, error, data);
    return res.status(status).json(resp_format);
  });
});

module.exports = router;
