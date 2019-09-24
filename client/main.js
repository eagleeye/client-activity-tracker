const events = ['mousemove', 'click'];

let sentData = {};
let operativeCache = {};
const eventsInfo = {};

document.addEventListener('DOMContentLoaded', function() {
	const rect = document.getElementById('rect');
	const container = document.getElementById('container');

	function eventHandler(event) {
		operativeCache[event.type] = operativeCache[event.type] || 0;
		operativeCache[event.type]++;
		displayEvent(event.type);
	}

	events.forEach(event => {
		operativeCache[event] = 0;
		container.insertAdjacentHTML(
			'beforeend',
			`<div class="info">${event}s: <span id="${event}-info">0</span></div>`
		);
		eventsInfo[event] = document.getElementById(event + '-info');
		rect.addEventListener(event, eventHandler);
	});

	getInitialData();
});

function displayEvent(eventName) {
	eventsInfo[eventName].innerText = operativeCache[eventName] + (sentData[eventName] || 0);
}

let isLocked = false;

function sendData() {
	if (Object.keys(operativeCache).length === 0) {
		return;
	}
	if (isLocked) {
		console.warn('sending in progress');
		return true;
	}
	isLocked = true;
	let tempCache = operativeCache;
	operativeCache = {};
	fetch('http://localhost:3030/events', {
		method: 'POST',
		mode: 'cors',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(tempCache),
	}).then(() => {
		sentData = mergePlain(tempCache, sentData);
		isLocked = false;
	}).catch(e => {
		console.error(e);
		operativeCache = mergePlain(tempCache, operativeCache);
		tempCache = {};
		isLocked = false;
	});
}

function getInitialData() {
	fetch('http://localhost:3030/stats', {
		credentials: 'include'
	}).then((res) => res.json()).then(data => {
		sentData = data;
		Object.keys(data).forEach(eventName => {
			displayEvent(eventName);
		});
		setInterval(sendData, 1000);
	});
}

const mergePlain = function(a, b) {
	const result = {};
	const keys = _.uniq(Object.keys(a).concat(Object.keys(b)));
	keys.forEach((field) => {
		result[field] = (a[field] || 0) + (b[field] || 0);
	});
	return result;
};
