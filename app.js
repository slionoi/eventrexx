var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index.js');
//var usersRouter = require('./routes/yt-dl');
//var spotify = require('./routes/spotifyApi.js');
var app = express();
var cors = require('cors');

// view engine setups
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'))
app.use(cors())
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use('/spot', spotify);
app.use('/', indexRouter)
//app.use('/u', usersRouter);

var port = process.env.PORT || 3000
app.listen(port,'0.0.0.0');
console.log("Listening on port ", port);
//module.exports = app;
// var http = require('http')
// server = http.createServer(app)
// server.listen(8000, '127.0.0.1', function () {
//   server.close(function () {
//     server.listen(3000, '0.0.0.0')
//   })
// })
