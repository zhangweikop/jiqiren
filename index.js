var express = require('express');
var playGround = require('./playground/playground.js');
var jsResource = express.static('./scripts');
var cssStyle = express.static('./style');
var app = express();

app.use('/scripts', jsResource);
app.use('/style', cssStyle);
app.get('/', function (req, res) {
  res.status(200).send('Coming Soon!');
});

app.use('/playground',playGround);
app.get('*', function(req, res){
  res.status(404).send('page not found!');
});

function start() {
	var port = process.argv[2];
	var server = app.listen(port || 8080, function () {
  		var host = server.address().address
  		var port = server.address().port;
 		console.log('app listening at http://%s:%s', host, port);		
	});
}
start();