const path = require('path');

module.exports = function override(config, env) {
  if (env === 'production') {
    config.output.filename = 'static/js/bundle.js';
  }

  config.output.path = path.resolve(__dirname, 'build');

  return config;
};
