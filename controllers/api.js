var EventModel = require("../models/event");

exports.getAllEvents = (req, result) => {
    EventModel.getAllEvents(req)
        .then(data => {
            result(null, data);
        })
        .catch(error => {
            result(error, null);
        });
};

exports.getEvent = (req, result) => {
    EventModel.getEvent(req)
        .then(data => {
            result(null, data);
        })
        .catch(error => {
            result(error, null);
        });
};

exports.addEvent = (req, result) => {
    EventModel.addEvent(req)
        .then(data => {
            result(null, data);
        })
        .catch(error => {
            result(error, null);
        });
};

exports.updateEvent = (req, result) => {
    EventModel.updateEvent(req)
        .then(data => {
            result(null, data);
        })
        .catch(error => {
            result(error, null);
        });
};

exports.deleteEvent = (req, result) => {
    EventModel.deleteEvent(req)
        .then(data => {
            result(null, data);
        })
        .catch(error => {
            result(error, null);
        });
};
