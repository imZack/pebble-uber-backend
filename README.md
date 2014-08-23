pebble-uber-backend
===================

This is a simple backend for fetching uber's pick up time from your location.

Installation
------------


Usage
-----

```
curl http://pebble-uber.yulun.me/\?latitude\=25.0422206\&longitude\=121.53816815
```

Response 200
```json

{"times":[{"localized_display_name":"UberBLACK","estimate":90,"display_name":"UberBLACK","product_id":"000f8239-1d78-41b5-a0bb-4beca64a3c09"},{"localized_display_name":"uberX","estimate":404,"display_name":"uberX","product_id":"bb693cd4-3366-4c48-9874-155de18a31f5"}]}
```
