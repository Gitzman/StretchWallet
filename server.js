
var express = require('express');
var app = express()

var port = process.env.PORT || 9091

// The built files can be served as static/public files
app.use('/static', express.static('dist/static'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/dist/index.html');
})


app.listen(port, function(req, res) {
  console.log('listening on port', port)
})
