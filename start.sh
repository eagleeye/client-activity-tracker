npx http-server client -o -c-1 -p 3031 & >/tmp/tracker-static.log
npx nodemon server/app.js -w server --ignore 'server/*.json' & >/tmp/tracker-server.log
tail -f /tmp/tracker-*.log
