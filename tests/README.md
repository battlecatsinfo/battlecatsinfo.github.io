## Unit test suite

```sh
$ node build.js -f  # perform a clean build
$ node server.js    # start the local server
```

Visit `http://localhost:8080/tests/test.html` to check the testing results.

### Notes

* Deleting the indexedDB manually (through the browser console) before running the test may be required, to prevent an error caused by version conflict.
