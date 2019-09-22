process.env.APP_ENV = 'test';
const chai = require('chai');
chai.use(require('chai-subset'));

global.expect = chai.expect;

require('../server/app');
