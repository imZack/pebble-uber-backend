var http = require('http');
var url = require('url');

var IP = process.env.IP || "localhost";
var PORT = process.env.PORT || 7777;
var API_TOKEN = process.env.API_TOKEN;
if (!API_TOKEN) {
  console.error("API_TOKEN=your_token_here node %s", __filename);
  console.error("https://developer.uber.com/v1/tutorials/#server-side-authentication");
  process.exit(1);
}
var uber = require('./index')(API_TOKEN);


http.createServer(function (req, res) {
  var ip = uber.getIp(req);
  console.log("%s %s GET %s", new Date().getTime(), ip, req.url); 
  var url_parts = url.parse(req.url, true);
  if (!url_parts.query.latitude || !url_parts.query.longitude) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      "message": "Missing parameters: latitude, longitude."
    }));
    return;
  }

  uber.fetchEstimateTime(url_parts.query.latitude,
                         url_parts.query.longitude,
                         url_parts.query.surge === '1',
    function(err, times) {
      if (err !== null) {
        err.code = err.code || 500;
        err.message = err.message || "Internal Error";
        console.error(err);
        res.writeHead(err.code, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: err.message}));
        return;
      }

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({times: times}));
      return;
    }
  );
}).listen(PORT, IP);

console.log('Server running at http://%s:%s', IP, PORT);
