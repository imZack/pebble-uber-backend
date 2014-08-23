var http = require('http');
var url = require('url');
var request = require('request');
var qs = require('qs');

var API_TOKEN = process.env.API_TOKEN;
var IP = process.env.IP || "localhost";
var PORT = process.env.PORT || 7777;

function getIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}

if (!API_TOKEN) {
  console.error("API_TOKEN=your_token_here node %s", __filename);
  console.error("https://developer.uber.com/v1/tutorials/#server-side-authentication");
  process.exit(1);
}

http.createServer(function (req, res) {
  console.log("%s %s GET %s", new Date().getTime(), getIp(req), req.url);
  var url_parts = url.parse(req.url, true);
  if (url_parts.pathname === '/favicon.ico') {
    res.writeHead(404);
    res.end();
    return;
  };

  if (!url_parts.query.latitude || !url_parts.query.longitude) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      "message": "Missing parameters: latitude, longitude."
    }));
    return;
  };

  var params = {
    'server_token': API_TOKEN,
    'start_latitude': url_parts.query.latitude,
    'start_longitude': url_parts.query.longitude
  };

  var request_url = "https://api.uber.com/v1/estimates/time?" +
                    qs.stringify(params);

  request.get({url: request_url},
    function (error, response, body) {
      if (response.statusCode != 200) {
        res.writeHead(response.statusCode,
                     {'Content-Type': 'application/json'});
        res.end(body);
        return;
      }

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(body);
  });
}).listen(PORT, IP);

console.log('Server running at http://%s:%s', IP, PORT);