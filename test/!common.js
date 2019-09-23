process.env.APP_ENV = 'test';
const chai = require('chai');
const { unlinkSync } = require('fs');
const { dbname } = require('cnf');
chai.use(require('chai-subset'));

global.expect = chai.expect;
//clear test data
try {
	unlinkSync(__dirname + '/../server/' + dbname);
} catch (e) {
	//ignore
}
require('../server/app');
