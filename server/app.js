const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const uuid = require('uuid/v4');
const { port } = require('cnf');

const eventsStorage = require('./eventsStorage');

app.use(cors({ origin: ['http://localhost:3031', 'http://127.0.0.1:3031'], credentials: true }));
app.use(bodyParser.json());
app.use(cookieSession({
	name: 'client-activity-tracker-session',
	secret: 'superSecretKey'
}));

app.use((req, res, next) => {
	if (req.session.isNew) {
		req.session.userId = uuid();
	}
	next();
});

app.post('/events', (req, res, next) => {
	eventsStorage.trackEvents({ userId: req.session.userId, events: req.body }).then(() => {
		res.send({ 'ok': true });
	}).catch(next);
});

app.get('/stats', (req, res, next) => {
	eventsStorage.getStats({ userId: req.session.userId })
		.then((data) => {
			res.send(data);
		}).catch(next);
});

app.use((err, req, res, next) => {
	console.error(err);
	res.sendStatus(500);
});

app.listen(port, (err) => {
	if (err) {
		throw err;
	}
	console.log('server started listening on port ' + port);
});
