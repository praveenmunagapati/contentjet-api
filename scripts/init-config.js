const uuid = require('uuid');
const fs = require('fs');

const secretKey = uuid.v4().replace(/-/g, '');

const data = `
module.exports = {
  // Secret key used for hashing passwords and generating tokens
  SECRET_KEY: '${secretKey}',
  // Database connection options. See http://knexjs.org/#Installation-client
  DATABASE: {
    client: 'postgresql', // Do not change. Only postgres is supported.
    connection: {
      host: 'localhost',
      database: 'contentjet-api',
      user: 'postgres',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  // The url where contentjet-ui is hosted
  FRONTEND_URL: 'https://example.com',
  // Email sending service
  MAIL_BACKEND: './backends/mail/MailGunBackend',
  MAIL_BACKEND_CONFIG: {
    mailGun: {
      auth: {
        api_key: '',
        domain: ''
      }
    }
  },
  // Email address used in the 'from' field of all email sent by this app
  MAIL_FROM: 'noreply@example.com',
  // The URL uploaded media is served from
  MEDIA_URL: 'https://media.example.com',
};
`;
try {
  fs.writeFileSync(`${__dirname}/../config/config.production.js`, data.trim(), { flag: 'wx' });
} catch (err) {
  process.exit();
}
