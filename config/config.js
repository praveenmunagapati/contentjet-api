if (!process.env.NODE_ENV) throw new Error('NODE_ENV not set');

module.exports = {
  PORT: 3000,
  // Secret key used for hashing passwords and generating tokens
  SECRET_KEY: null,
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
  FRONTEND_URL: 'http://localhost:9000',
  // The duration in seconds an authentication token (JWT) is valid for
  TOKEN_EXPIRY: 3600,
  // When false the user will receive a signup confirmation email. When true
  // the user will NOT receive a confirmation email and will be have isActive = true
  // set immediately upon signup. Recommended this remains false in production.
  ACTIVE_ON_SIGNUP: false,
  // When true, stack traces will be logged.
  DEBUG: false,
  // Cross-Origin Resource Sharing. See https://github.com/koajs/cors for options
  CORS: {
    origin: '*'
  },
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
  PERMISSION_BACKENDS: [
    './backends/permissions/ModelPermissionBackend',
    './backends/permissions/ProjectPermissionBackend'
  ],
  STORAGE_BACKEND: './backends/storage/DiskStorageBackend',
  // File system path to media directory
  MEDIA_ROOT: 'media/',
  // When true files in MEDIA_ROOT will served at the path /media.
  // Use in production is strongly discouraged.
  SERVE_MEDIA: false,
  // The URL uploaded media is served from
  MEDIA_URL: 'http://localhost:3000/media/',
  // The dimensions of thumbnails created from uploaded images. Set values to 0
  // to disable thumbnail generation.
  THUMBNAIL: {
    width: 200,
    height: 200
  }
};
