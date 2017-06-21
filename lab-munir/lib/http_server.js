'use strict';

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const cowsay = require('cowsay');

// callback should be (err, body) => undefinied
const bodyParse = (req, callback) => {
  let body = ''
  req.on('data', (buffer) => {
    body += buffer.toString();
  });
  req.on('end', () => callback(null, body));
  req.on('error', (err) => callback(err));
}

const server = http.createServer((req, res) => {
  req.url = url.parse(req.url);
  req.url.query = querystring.parse(req.url.query);

  bodyParse(req, (err, body) => {
    if (err) {
      res.writeHead(500);
      res.end();
      return;
    };

    // parse the body as json
    try {
      req.body = JSON.parse(body);
    } catch (err) {
      // if there was malformated JSON we send back a 400 bad request
      res.writeHead(400);
      res.end();
      return;
    };

    // respond with a status code 200 and sends back 'Hello, world!'
    if (req.url.pathname === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
      });
      res.write('Hello, world!');
      return;
    };

    // if the url is /time send back the data
    if (req.method === 'GET' && req.url.pathname === '/time') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      });
      res.write(JSON.stringify({
        now: Date.now(),
        data: new Date(),
      }));
      res.end();
      return;
    }

    // if the path name is /echo, send back their body as JSON
    if (req.method === 'POST' && req.url.pathname === '/echo') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      });
      res.write(JSON.stringify(req.body));
      res.end();
      return;
    };

    if (req.method === 'GET' && req.url.pathname === '/cowsay') {
      try {
        res.writeHead(200, {
          'Content-Type': 'text/plain',
        });
        let message = req.url.query.text;
        res.write(cowsay.say({text: message}));
      } catch (err) {
        res.writeHead(400);
        res.write(cowsay.say({text: 'bad request\ntry: localhost:4000/cowsay?text=<message>'}));
      };
      res.end();
      return;
    };
  });

  if (req.method === 'POST' && req.url.pathname === '/cowsay') {
    res.write(req.body.text);
    try {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
      });
      // let message = req.url.query.text;
      res.write(cowsay.say(req.body));
    } catch (err) {
      res.writeHead(400);
      res.write(cowsay.say({text: 'bad request\ntry: localhost:4000/cowsay?text=<message>'}));
    };
    res.end();
    return;
  };
});


server.listen(4000, () => {
  console.log('server up on port 4000');
});
