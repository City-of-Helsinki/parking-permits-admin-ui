const dotenvExpand = require('dotenv-expand');
const dotenv = require('dotenv');

dotenvExpand.expand(dotenv.config({ path: '.env.test' }));
