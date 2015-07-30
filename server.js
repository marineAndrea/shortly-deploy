// start mongus and connect to database this is async
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/my_database');

var app = require('./server-config.js');

var port = process.env.PORT || 4568;

app.listen(port);

console.log('Server now listening on port ' + port);
