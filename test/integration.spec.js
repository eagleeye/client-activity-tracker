const request = require('request-promise-native');
const { port } = require('cnf');

const user1 = request.jar();
const user2 = request.jar();

const wait = (time) => new Promise(resolve => setTimeout(resolve, time));

const baseUrl = 'http://localhost:' + port;

describe('events storage API', () => {
	describe('simple case', () => {
		before('should store events via webBeacon', () => {
			return request.post({
				uri: `${baseUrl}/events`,
				json: true,
				jar: user1,
				body: {
					mousemove: 14,
					click: 5
				}
			});
		});

		it('should return events stats for this user', async () => {
			const body = await request.get(`${baseUrl}/stats`, { jar: user1, json: true });
			expect(body).to.containSubset({
				mousemove: 14,
				click: 5
			});
		});

		it('should return 0 stats for second user', async () => {
			const body = await request.get(`${baseUrl}/stats`, { jar: user2, json: true });
			expect(body).to.be.deep.eql({});
		});
	});

	describe('concurrent requests from 50 users', () => {
		let jars = [];

		before('send request from 50 users', async () => {
			const promises = [];
			const MIN_I = 0;
			const MAX_I = 50;

			for (let i = MIN_I; i <= MAX_I; i++) {
				jars[i] = request.jar();
				//generate predicable random stats data
				promises.push(makeRequestPromise(jars[i], i));
			}
			//1st request to send data
			await Promise.all(promises);
			//2nd request to send data
			const promises2 = [];
			for (let i = MIN_I; i <= MAX_I; i++) {
				promises2.push(makeRequestPromise(jars[i], i * 2));
			}
			await Promise.all(promises2);

			function makeRequestPromise(jar, multiplier) {
				return request.post({
					uri: `${baseUrl}/events`,
					json: true,
					jar: jar,
					body: {
						mousemove: multiplier * 5,
						click: multiplier
					}
				});
			}
		});

		it('should return merged counters for all 50 users', async () => {
			const result = await Promise.all(jars.map(jar => {
				return request.get(`${baseUrl}/stats`, { jar: jar, json: true });
			}));
			jars.forEach((jar, index) => {
				//we have formula to calculate counters for each user based on index
				//It should return sum of events from 1st and second call
				expect(result[index], `Index ${index}: `).to.be.eql({
					mousemove: index * 3 * 5,
					click: index * 3
				});
			});
		});

		it('should store data in fs in 1s', async () => {
			await wait(1000);
			const data = require('../server/db_test');
			expect(Object.keys(data)).to.have.length(52);
		});
	});
});
