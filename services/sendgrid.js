// mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// client
const sgClient = require('@sendgrid/client');
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

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

async function addContactToLists(
  email,
  first_name,
  last_name,
  account_consent,
  marketing_consent
) {
  const account = '505f339b-5361-4fd2-a4eb-8ee7dafac25b';
  const marketing = '517b4dda-ab7b-4b44-9065-c562eb1f9eab';
  let list_ids = [];

  if (account_consent) {
    list_ids.push(account);
  }

  if (marketing_consent) {
    list_ids.push(marketing);
  }

  const data = {
    list_ids: list_ids,
    contacts: [
      {
        email: email,
        first_name: first_name,
        last_name: last_name,
      },
    ],
  };

  const request = {
    url: `/v3/marketing/contacts`,
    method: 'PUT',
    body: data,
  };

  return await sgClient
    .request(request)
    .then(([response, body]) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
}

async function removeContactsFromList(consent, email) {
  const account = '505f339b-5361-4fd2-a4eb-8ee7dafac25b';
  const marketing = '517b4dda-ab7b-4b44-9065-c562eb1f9eab';

  const userId = await getUserId(email);
  if (userId instanceof Error) throw new Error(userId);

  const queryParams = {
    contact_ids: userId,
  };

  return consent.forEach(async (e) => {
    let request = {};
    if (e.account) {
      request = {
        url: `/v3/marketing/lists/${account}/contacts`,
        method: 'DELETE',
        qs: queryParams,
      };

      return await sgClient
        .request(request)
        .then(([response]) => {
          // console.log(response);
          return response;
        })
        .catch((error) => {
          console.log(error);

          return error;
        });
    }

    if (e.marketing) {
      request = {
        url: `/v3/marketing/lists/${marketing}/contacts`,
        method: 'DELETE',
        qs: queryParams,
      };

      return await sgClient
        .request(request)
        .then(([response]) => {
          // console.log(response);
          return response;
        })
        .catch((error) => {
          console.log(error);

          return error;
        });
    }
  });
}

async function getUserId(email) {
  const data = {
    emails: [email],
  };

  const request = {
    url: `/v3/marketing/contacts/search/emails`,
    method: 'POST',
    body: data,
  };

  return await sgClient
    .request(request)
    .then(([response, body]) => {
      // console.log(response.body.result[email].contact.id);
      return response.body.result[email].contact.id;
    })
    .catch((error) => {
      return error;
    });
}

module.exports = {
  sendResetEmail,
  sendVerificationEmail,
  sendSubscriptionLink,
  addContactToLists,
  removeContactsFromList,
};
