const request = require('request-promise-native');
const { port } = require('cnf');

const user1 = request.jar();
const user2 = request.jar();

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
});
