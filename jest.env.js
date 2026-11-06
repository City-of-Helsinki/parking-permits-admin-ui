const dotenvExpand = require('dotenv-expand');
const dotenv = require('dotenv');
const { TextEncoder, TextDecoder } = require('node:util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

dotenvExpand.expand(dotenv.config({ path: '.env.test' }));
