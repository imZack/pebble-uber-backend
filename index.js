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


function fetch(endpoint, params, cb) {
  params = params || {};
  var qstring = qs.stringify(params);
  var url = API_BASE + endpoint + "?" + qstring;
  request.get({url: url}, function(error, response, body) {
    // failed
    if (response.statusCode !== 200) {
      cb({
        code: response.statusCode,
        message: JSON.parse(body).message
      }, null);
      return;
    }

    var obj = null;
    try {
      obj = JSON.parse(body);
    } catch (e) {
      cb({message: "Invaild JSON string"}, null);
      return;
    }

    cb(null, obj);
  });
}


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

  fetch("estimates/price", params, function(err, result) {
    if (err) {
      cb(err, null);
      return;
    }

    // success, fire callback with results
    cb(null, result.prices);
    return;
  });
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

  fetch("estimates/time", params, function(err, result) {
    if (err) {
      cb(err, null);
      return;
    }

    var times = result.times;
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
      if (err) {
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
      return;
    });
  });
};


var fetchProducts = function fetchProducts(latitude, longitude, cb) {
  var params = {
    server_token: API_TOKEN,
    latitude: latitude,
    longitude: longitude
  };

  fetch("products", params, function(err, result) {
    if (err) {
      cb(err, null);
      return;
    }

    cb(null, result.products);
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
    fetchEstimateTime: fetchEstimateTime,
    fetchProducts: fetchProducts
  };
};
