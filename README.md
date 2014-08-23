Uber Now (backend)
==================

This is a simple backend for fetching uber's pick up time from your location via [Uber API](https://developer.uber.com/).

Server Usage
------------
ENV variables
- IP **default: localhost**
- PORT **default: 7777**
- API_TOKEN  **default: None**

```
API_TOKEN=xxxx node index.js
Server running at http://localhost:7777
```

Client Usage
------------
Query parameters
- latitude
- longitude

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

Reference
---------
https://developer.uber.com/

License
-------
[MIT](http://yulun.mit-license.org/)
