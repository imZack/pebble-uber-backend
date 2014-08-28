var request = require('request');
var qs = require('qs');


var API_TOKEN = process.env.API_TOKEN;


if (!API_TOKEN) {
  console.error("API_TOKEN=your_token_here node %s", __filename);
  console.error("https://developer.uber.com/v1/tutorials/#server-side-authentication");
  process.exit(1);
}


var getIp = function getIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

var fetchSurgePrice = function fetchSurgePrice(latitude, longitude, times, cb) {
  var params = {
    start_latitude: latitude,
    start_longitude: longitude,
    end_latitude: latitude,
    end_longitude: longitude,
    server_token: API_TOKEN,
  };
  var request_url = "https://api.uber.com/v1/estimates/price?" +
                    qs.stringify(params);
  request.get({url: request_url},
    function(error, response, body) {
      // failed
      if (response.statusCode !== 200) {
        console.log("Can't fetch price for %s", request_url);
        console.log(body);
        cb(times);
        return;
      }
      
      var prices = JSON.parse(body).prices;
      prices.forEach(function(price) {
        times.forEach(function(product) {
          if (product.product_id === price.product_id) {
            product.surge_multiplier = price.surge_multiplier;
          }
        });
      });
      // finish, execute callback
      cb(times);
    });
};

var fetchEstimateTime = function fetchEstimateTime(latitude, longitude, cb) {
  var params = {
    server_token: API_TOKEN,
    start_latitude: latitude,
    start_longitude: longitude
  };

  var request_url = "https://api.uber.com/v1/estimates/time?" +
                    qs.stringify(params);

  request.get({url: request_url},
    function (error, response, body) {
      // failed
      if (response.statusCode != 200) {
        res.writeHead(response.statusCode,
                     {'Content-Type': 'application/json'});
        res.end(body);
        return;
      }
      // sucess
      // if we have uber now, go fetching the surge price.
      var times = JSON.parse(body).times;
      if (times.length !== 0) {
        fetchSurgePrice(latitude, longitude, times, cb);
      } else {
        cb(times);
      }
  });
};

module.exports = {
  getIp: getIp,
  fetchSurgePrice: fetchSurgePrice,
  fetchEstimateTime: fetchEstimateTime
};
