Uber Now (backend)
==================

This is a simple backend for fetching uber's pick up time from your location via [Uber API](https://developer.uber.com/).

Any feature requests is welcome:ok_hand: , please [create a new issue](https://github.com/imZack/pebble-uber-backend/issues/new)

Server Usage
------------
ENV variables
- API_TOKEN  (required) [Apply Link](https://developer.uber.com/)
- IP (optional) **default: 0.0.0.0**
- PORT (optional) **default: 8080**

```
API_TOKEN=xxxx node index.js
Server running at http://0.0.0.0:8080
```

Client Usage
------------
Query parameters
- latitude (required)
- longitude (required)
- surge (optional) if `surge=1` it will embedded surge pricing data as `surge_multiplier`

```
curl http://pebble-uber.yulun.me/\?latitude\=25.0422206\&longitude\=121.53816815
```

- Response 200
```json
{
  "times": [
    {
      "localized_display_name": "uberX",
      "estimate": 440,
      "display_name": "uberX",
      "product_id": "49348f0a-c623-46c0-86eb-9c2f761e8de8",
      "surge_multiplier": 1,
      "image": "http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png",
      "description": "THE LOW-COST UBER WITH RIDESHARING"
    },
    {
      "localized_display_name": "UberBLACK",
      "estimate": 302,
      "display_name": "UberBLACK",
      "product_id": "9073f2ef-42c1-4e01-b3cb-bb5d561c9821",
      "surge_multiplier": 1,
      "image": "http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-black.png",
      "description": "The Original Uber"
    }
  ],
  "is_available": true
}
```

- Response 400
```json
{
  "message":"Missing parameters: latitude, longitude."
}
```

TODO
----
- Add tests
- ...

Reference
---------
https://developer.uber.com/

Author
------
YuLun Shih shih@yulun.me

License
-------
[MIT](http://yulun.mit-license.org/)
