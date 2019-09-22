const events = ['mousemove', 'click'];

document.addEventListener('DOMContentLoaded', function() {
	const rect = document.getElementById('rect');
	const container = document.getElementById('container');
	const eventsCounter = {};
	const eventsInfo = {};

	function eventHandler(event) {
		eventsCounter[event.type]++;
		eventsInfo[event.type].innerText = eventsCounter[event.type];
	}

	events.forEach(event => {
		eventsCounter[event] = 0;
		container.insertAdjacentHTML(
			'beforeend',
			`<div class="info">${event}s: <span id="${event}-info">0</span></div>`
		);
		eventsInfo[event] = document.getElementById(event + '-info');
		rect.addEventListener(event, eventHandler);
	});
});
