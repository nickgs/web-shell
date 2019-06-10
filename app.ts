import * as express from 'express';
import * as pty from 'pty.js';

const app = express();
const expressWs = require('express-ws')(app);

// Serve static assets from ./static
app.use(express.static(`${__dirname}/static`));

// Instantiate shell and set up data handlers
expressWs.app.ws('/shell', (ws, req) => {
  // Spawn the shell
  // Compliments of http://krasimirtsonev.com/blog/article/meet-evala-your-terminal-in-the-browser-extension
  const shell = pty.spawn('/bin/bash', [], {
    name: 'xterm-color',
    cwd: '/app',
    env: process.env
  });
  // For all shell data send it to the websocket
  shell.on('data', (data) => {
    ws.send(data);
  });
  // For all websocket data send it to the shell
  ws.on('message', (msg) => {
    shell.write(msg);
  });

  setInterval(function() {
	if(ws.readyState === 1) {
		ws.ping("heartbeat");
	}
  }, 1000);
});

// Start the application
app.listen(4000);
