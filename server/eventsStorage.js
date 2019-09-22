const { readFile, writeFile, readFileSync } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const merge = require('deepmerge');
const fpath = __dirname + '/db.json';
const mergeOptions = { customMerge: () => (a, b) => a + b };

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
	operativeCache[userId] = merge(operativeCache[userId] || {}, events, mergeOptions);
	return true;
}

async function getStats({ userId }) {
	return merge(operativeCache[userId] || {}, cache[userId] || {}, mergeOptions);
}

let isLocked = false;

async function syncStorage() {
	if (isLocked) {
		console.warn('sync is locked, consider bigger timeout');
		return;
	}
	//when app will scale to more instances - switch to lock file
	isLocked = true;
	let tempCache = operativeCache;
	operativeCache = {};
	let storedData = {};
	try {
		storedData = JSON.parse(await readFileAsync(fpath, 'utf8'));
	} catch (e) {
		//ignore error
	}
	const newStoredData = merge(storedData, tempCache, mergeOptions);
	await writeFileAsync(fpath, JSON.stringify(newStoredData), 'utf8');
	cache = newStoredData;
	isLocked = false;
}

setInterval(() => {
	syncStorage().catch(console.error);
}, 500);

