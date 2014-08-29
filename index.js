var request = require('request');
var qs = require('qs');
var API_BASE = "https://api.uber.com/v1/";
var API_TOKEN = '';


/**
 * Get ip utility
 * @param  {[type]} req [http req]
 * @return {[type]}     [IP string]
 */
var getIp = function getIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};


/**
 * Fetch surge price information by given current location
 * @param  {[type]}   latitude  [latitude]
 * @param  {[type]}   longitude [longitude]
 * @param  {Function} cb        [callback(err, result)]
 * @return {[type]}             [description]
 */
var fetchSurgePrice = function fetchSurgePrice(latitude, longitude, cb) {
  var params = {
    start_latitude: latitude,
    start_longitude: longitude,
    end_latitude: latitude,
    end_longitude: longitude,
    server_token: API_TOKEN,
  };
  var request_url = API_BASE + "estimates/price?" + qs.stringify(params);
  request.get({url: request_url},
    function(error, response, body) {
      // failed if statusCode is not 200 OK
      if (response.statusCode !== 200) {
        var err = {
          code: response.statusCode,
          message: "Can't fetch price for " + request_url,
          log: body
        };
        // fire callback with error
        cb(err, null);
        return;
      }
      
      try {
        // success, fire callback with results
        cb(null, JSON.parse(body).prices);
        return;
      } catch(e) {
        cb({message: "Invaild JSON string"}, null);
        return;
      }
    }
  );
};


/**
 * Fetch estimate pick up time by given location
 * @param  {[type]}   latitude  [latitude]
 * @param  {[type]}   longitude [longitude]
 * @param  {Function} cb        [callback(err, result)]
 * @return {[type]}             [description]
 */
var fetchEstimateTime = function fetchEstimateTime(latitude, longitude,
                                                   surge, cb) {
  var params = {
    server_token: API_TOKEN,
    start_latitude: latitude,
    start_longitude: longitude
  };

  var request_url = API_BASE + "estimates/time?" + qs.stringify(params);
  request.get({url: request_url},
    function (error, response, body) {
      // failed
      if (response.statusCode !== 200) {
        cb({
          code: response.statusCode,
          message: JSON.parse(body).message
        },null);
        return;
      }

      var times = null;
      try {
        times = JSON.parse(body).times;       
      } catch (e) {
        cb({message: "Invaild JSON string"}, null);
        return;
      }

      // sucess
      // if we have uber now, go fetching the surge price.
      if (times.length === 0) {
        cb(null, times);
        return;
      }

      // no need embedded surge price
      if (surge !== true) {
        cb(null, times);
        return;
      }

      // get surge pirce and merge
      fetchSurgePrice(latitude, longitude, function(err, prices) {
        if (err !== null) {
          cb(err, null);
          return;
        }

        prices.forEach(function(price) {
          times.forEach(function(product) {
            if (product.product_id === price.product_id) {
              product.surge_multiplier = price.surge_multiplier;
            }
          });
        });

        // finally, fire success callabck
        cb(null, times);
      });
  });
};


/**
 * Expose API
 */
module.exports = function(server_token) {
  API_TOKEN = server_token;
  return {
    getIp: getIp,
    fetchSurgePrice: fetchSurgePrice,
    fetchEstimateTime: fetchEstimateTime
  };
};
