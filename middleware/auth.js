const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const key = req.header('Authorization');
  //check if id is defined
  if (!key) {
    res.status(401).send('Access denied');
    return;
  }

  let token = key.split(' ')[1];
  const user = jwt.verify(
    token,
    process.env.JWT_SECRET_KEY,
    function (err, decoded) {
      if (err) {
        res.status(401).send('Access denied');
        return;
      }
      return decoded;
    }
  );

  console.log(user.id, '//////token');
  req.id = user.id;
  next();
};
