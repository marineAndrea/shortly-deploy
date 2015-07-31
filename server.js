// start mongus and connect to database this is async
var mongoose = require('mongoose');
var database = require('./app/database').database;

var app = require('./server-config.js');

var port = process.env.PORT || 4568;

database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', function() {
  app.listen(port);
  console.log('Server now listening on port ' + port);
});