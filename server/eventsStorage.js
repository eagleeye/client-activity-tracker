const { readFile, writeFile, readFileSync } = require('fs');
const { promisify } = require('util');
const { dbname } = require('cnf');
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const _ = require('lodash');

const fpath = __dirname + '/' + dbname;

module.exports = {
	trackEvents,
	getStats
};

//initial read db into memory
let cache;
try {
	cache = JSON.parse(readFileSync(fpath, 'utf8'));
} catch (e) {
	cache = {};
}
let operativeCache = {};

async function trackEvents({ userId, events }) {
	operativeCache[userId] = mergePlain(operativeCache[userId] || {}, events);
	return true;
}

async function getStats({ userId }) {
	return mergePlain(operativeCache[userId] || {}, cache[userId] || {});
}

let isLocked = false;

async function syncStorage() {
	if (isLocked) {
		console.warn('sync is locked, consider bigger timeout');
		return;
	}
	//when app will scale to more instances - switch to lock file
	isLocked = true;
	let storedData = {};
	try {
		storedData = JSON.parse(await readFileAsync(fpath, 'utf8'));
	} catch (e) {
		//ignore error
	}
	let tempCache = operativeCache;
	operativeCache = {};
	const newStoredData = mergeL2(storedData, tempCache);
	cache = newStoredData;
	await writeFileAsync(fpath, JSON.stringify(newStoredData), 'utf8');
	isLocked = false;
}

setInterval(() => {
	syncStorage().catch(console.error);
}, 500);

const mergePlain = function(a, b) {
	const result = {};
	const keys = _.uniq(Object.keys(a).concat(Object.keys(b)));
	keys.forEach((field) => {
		result[field] = (a[field] || 0) + (b[field] || 0);
	});
	return result;
};

const mergeL2 = function(a, b) {
	const result = {};
	const keys = _.uniq(Object.keys(a).concat(Object.keys(b)));
	keys.forEach((field) => {
		result[field] = mergePlain(a[field] || {}, b[field] || {});
	});
	return result;
};

