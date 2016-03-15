var express = require('express');
var cssStyle = express.static(__dirname + '/style');
var scripts = express.static(__dirname + '/scripts');
var imgs = express.static(__dirname + '/imgs');
var webgl = express.static(__dirname + '/webgl');

var app = express();
var fs = require('fs');
module.exports = app;
// ...

app.use('/style', cssStyle);
app.use('/scripts', scripts);
app.use('/images', imgs);
app.use('/webgl', webgl);

var fileName = 'playground.html';
var options = {
    root : 'playground',
    headers: {
        'content-type': 'text/html; charset=utf-8',
        'Connection': 'keep-alive'
    }
  };
app.get('/2D', function (req, res, next) {
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

var fileName3D = 'playground-3d.html';

app.get('/3d', function (req, res, next) {
  res.sendFile(fileName3D, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      //console.log('Sent:', fileName);
    }
  });
});