async function generateCode() {
  //generate random code
  const code = Math.floor(1000 + Math.random() * 9000);
  return code;
}

async function validateCode(user, code) {
  if(user.validation_code == null) {
    return false
  }
  if (user.validation_code == code) {
    return true;
  }
  return false;
}

async function saveUpdateuser(user) {
  //validate email and remove code
  user.validation_code = null;
  user.email_verified = true;

  user = await user.save();
  return user;
}

async function setResetState(user) {
  //validate email and remove code
  user.validation_code = null;
  user.email_verified = true;
  user = await user.save();
  return user.email;
}

module.exports = {
  generateCode,
  validateCode,
  saveUpdateuser,
  setResetState,
};
