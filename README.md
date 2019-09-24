# client-activity-tracker
app that tracks user events
# Installation
`npm i`
# Run tests
`npm test`
# Start app
`npm start`
#How to add more events to track? 
just edit array of events `const events = ['mousemove', 'click'];` at `client/main.js`
#Questions to think about:
1. To track events count from all users - create endpoint that will aggregate data
2. To implement player - store events with timestamps and coordinates separately
3. To handle billions of events - the storage should be switched to ClickHouse or something else that can handle big amounts of data
