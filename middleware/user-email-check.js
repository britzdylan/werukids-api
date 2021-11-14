const User = require('../models/user');

module.exports = async function (req, res, next) {
  const key = req.body.email;
  //check if id is defined
  if (!key) {
    res.status(401).send('Invalid Email Address');
    return;
  }
  let user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    res.status(401).send('User not found');
    return;
  }

  if (!user.email_verified) {
    res.status(401).send('User not found');
    return;
  }

  if (!user.account_finalized) {
    res.status(401).send('User not found');
    return;
  }

  req.user = user;
  next();
};
