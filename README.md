Uber Now (backend)
==================

This is a simple backend for fetching uber's pick up time from your location via [Uber API](https://developer.uber.com/).

Any feature requests is welcome:ok_hand: , please [create a new issue](https://github.com/imZack/pebble-uber-backend/issues/new)

Server Usage
------------
ENV variables
- API_TOKEN  (required) [Apply Link](https://developer.uber.com/)
- IP (optional) **default: localhost**
- PORT (optional) **default: 7777**

```
API_TOKEN=xxxx node index.js
Server running at http://localhost:7777
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
      "localized_display_name": "UberBLACK",
      "estimate": 90,
      "display_name": "UberBLACK",
      "product_id": "000f8239-1d78-41b5-a0bb-4beca64a3c09"
    },
    {
      "localized_display_name": "uberX",
      "estimate": 404,
      "display_name": "uberX",
      "product_id": "bb693cd4-3366-4c48-9874-155de18a31f5"
    }
  ]
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
