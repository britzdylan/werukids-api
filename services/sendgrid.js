const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendWelcomeEmail(email, code) {
  const msg = {
    from: "noreply@bidheap.com", // Change to your verified sender
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
    template_id: "d-8420f286d89940098684c14d4af8a90e",
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
  sendWelcomeEmail,
};
