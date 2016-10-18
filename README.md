# SCDHTCrawler  
[![Build Status](https://travis-ci.org/helloqiu/SCDHTCrawler.svg?branch=master)](https://travis-ci.org/helloqiu/SCDHTCrawler)
[![codecov](https://codecov.io/gh/helloqiu/SCDHTCrawler/branch/master/graph/badge.svg)](https://codecov.io/gh/helloqiu/SCDHTCrawler)  

A DHT crawler likes small chicken.
# Usage  
``` js
var SCCrawler = require('./dist/crawler.js');

var handleGetPeers = function(infohash, addr) {
  console.log(infohash);
}
var handleAnnouncePeers = function(infohash, addr) {
  console.log(infohash);
}

var crawler = new SCCrawler(handleGetPeers, handleAnnouncePeers);
crawler.run();
```
# License
ISC
