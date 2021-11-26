const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(email, code) {
  const msg = {
    from: 'werukids@gmail.com', // Change to your verified sender
    personalizations: [
      {
        to: [
          {
            email: email,
          },
        ],
        dynamic_template_data: {
          code: code,
        },
      },
    ],
    template_id: 'd-cff8c3d4bdc842d9a0270f456f8b97fb',
  };

  return await sgMail
    .send(msg)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
}

async function sendResetEmail(email, code) {
  const msg = {
    from: 'werukids@gmail.com', // Change to your verified sender
    personalizations: [
      {
        to: [
          {
            email: email,
          },
        ],
        dynamic_template_data: {
          code: code,
        },
      },
    ],
    template_id: 'd-f956a3d7007c4d4284187d6f5f194fac',
  };

  return await sgMail
    .send(msg)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
}

async function sendSubscriptionLink(email, link) {
  const msg = {
    from: 'werukids@gmail.com', // Change to your verified sender
    personalizations: [
      {
        to: [
          {
            email: email,
          },
        ],
        dynamic_template_data: {
          link: link,
        },
      },
    ],
    template_id: 'd-82ebdd5555844001ab5915b2ebbbb7ae',
  };

  return await sgMail
    .send(msg)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
}

module.exports = {
  sendResetEmail,
  sendVerificationEmail,
  sendSubscriptionLink,
};
