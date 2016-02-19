var express = require('express');
var cssStyle = express.static(__dirname + '/style');
var scripts = express.static(__dirname + '/scripts');
var imgs = express.static(__dirname + '/imgs');

var app = express();
var fs = require('fs');
module.exports = app;
// ...

app.use('/style', cssStyle);
app.use('/scripts', scripts);
app.use('/images', imgs);

var fileName = 'playground.html';
var options = {
    root : 'playground',
    headers: {
        'content-type': 'text/html; charset=utf-8',
        'Connection': 'keep-alive'
    }
  };
app.get('/', function (req, res, next) {
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      //console.log('Sent:', fileName);
    }
  });
});

