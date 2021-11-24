// const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);
const axios = require('axios');
const base_url = 'https://api.paystack.co';
const paystack = axios.create({
  baseURL: base_url,
  timeout: 1000,
  headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
});

async function initPayment(amount, email, callback_url, plan) {
  return paystack
    .post(`${base_url}/transaction/initialize`, {
      amount: amount,
      email: email,
      currency: 'ZAR',
      callback_url: callback_url,
      plan: plan,
      channels: ['card'],
    })
    .then(function (res) {
      // console.log(res.data);
      return res.data;
    })
    .catch(function (error) {
      return error.response.data;
    });
}

// async function manageSubscription(id) {
//   const res = await getCustomer(id);
//   if (!res.status) {
//     return res;
//   }

//   const code = res.data.subscriptions[0].subscription_code;
//   console.log(code, 'code');
//   return paystack
//     .get(`${base_url}/subscription/${code}/manage/link`)
//     .then(function (res) {
//       console.log(res);
//       return res.data;
//     })
//     .catch(function (error) {
//       console.log(error.response);
//       return error.response.data;
//     });
// }

async function verifyPayment(reference) {
  return paystack
    .get(`${base_url}/transaction/verify/${reference}`)
    .then(function (res) {
      return res.data;
    })
    .catch(function (error) {
      return error.response.data;
    });
}

async function getCustomer(id) {
  return paystack
    .get(`${base_url}/customer/${id}`)
    .then(function (res) {
      console.log(res.data);
      return res.data;
    })
    .catch(function (error) {
      return error.response.data;
    });
}

async function deactivate(code, token) {
  return paystack
    .post(`${base_url}/subscription/disable`, {
      code: code,
      token: token,
    })
    .then(function (res) {
      console.log(res.data);
      return res.data;
    })
    .catch(function (error) {
      return error.response.data;
    });
}

module.exports = {
  initPayment,
  manageSubscription,
  verifyPayment,
  getCustomer,
  deactivate,
};
