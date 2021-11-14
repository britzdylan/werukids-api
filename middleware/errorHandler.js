const winston = require("winston");
module.exports = function (err, req, res, next) {
  winston.error(err.message, err);
  if (res.statusCode != 200) {
    res.send(err.message);
  } else {
    res.status(500).send(err.message);
  }
};
