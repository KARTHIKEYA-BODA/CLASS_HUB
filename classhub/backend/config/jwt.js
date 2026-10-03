require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'classhub_fallback_secret_do_not_use_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};
