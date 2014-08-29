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

  var cb = function(err, results) {
    if (err) {
      err.code = err.code || 500;
      err.message = err.message || "Internal Error";
      console.error(err);
      res.writeHead(err.code, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: err.message}));
      return;
    }
    
    var is_available = results.products.length !== 0;
    var products = results.products;
    var times = results.times;

    // no cars, check area available or not
    if (times.length === 0 && !is_available) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({times: [], is_available: is_available}));
      return;
    }

    if (products && products.length > 0) {
      products.forEach(function(productP) {
        times.forEach(function(productT) {
          if (productP.product_id === productT.product_id) {
            productT.image = productP.image;
            productT.description = productP.description;
          }
        });
      });
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({times: times, is_available: is_available}));
    return;
  };

  var results = {
    products: null,
    times: null
  };

  var create_cb = function(results, prop, cb) {
    return function(err, result) {
      if (err) {
        cb(err, null);
        return;
      }

      results[prop] = result;
      for (var key in results) {
        if (results[key] === null) return;
      }
      cb(null, results);
    };
  };

  uber.fetchProducts(url_parts.query.latitude, url_parts.query.longitude,
    create_cb(results, "products", cb)
  );

  uber.fetchEstimateTime(url_parts.query.latitude,
                         url_parts.query.longitude,
                         url_parts.query.surge !== '0',
                         create_cb(results, "times", cb));
}).listen(PORT, IP);

console.log('Server running at http://%s:%s', IP, PORT);
