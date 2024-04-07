const path = require('path');

module.exports = function override(config, env) {
  if (env === 'production') {
    config.output.filename = 'static/js/bundle.js';
    config.plugins[5].options.filename = 'static/css/bundle.css';
  }

  config.output.path = path.resolve(__dirname, 'build');

  return config;
};
