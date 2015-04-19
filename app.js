var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var twitter = require('twitter');

server.listen(3000);

var twit = new twitter({
  consumer_key: 'hE7u0sbyOnLth4NJBHbQgZ0zp',
  consumer_secret: 'V6h4i60wc48x6LFHupmZMjoNlneKJWgeAeEnG5XZhwBpq9UfLf',
  access_token_key: '56804007-9VMcKiEd8cUDa4TdyxAMTduEoDy29FDCOWZd0oxaz',
  access_token_secret: 'jbulWtSuA27jIKb5JzskSAzRG2cqgAwZpr6zW40Jb0W37'
});

function containsCoordinates(boundingBox, coordinates) {
  if(boundingBox.swlng <= coordinates[0] && 
     boundingBox.nelng >= coordinates[0] &&
     boundingBox.swlat <= coordinates[1] &&
     boundingBox.nelat >= coordinates[1]) {
    console.log("Coords inside bounding box");
    return true;
  }
  console.log("Coords outside bounding box");
  return false;
}


io.use(function(socket, next) {
  var handshakeData = socket.request._query;
  console.log(handshakeData);

  var param = {locations: handshakeData.swlng + ', ' + handshakeData.swlat + ', ' + handshakeData.nelng + ', ' + handshakeData.nelat};
  console.log(param);

  twit.stream('statuses/filter', param,  function(stream){
    stream.on('data', function(data) {
      console.log(data.text);
      if(data.coordinates != null && containsCoordinates(handshakeData, data.coordinates.coordinates)) {
        io.emit('tweet', {
          user: data.user.screen_name,
          text: data.text,
          lng: data.coordinates.coordinates[0],
          lat: data.coordinates.coordinates[1]
        });
      }

    });

    stream.on('error', function(error) {
      console.log(error);
    });
  });

  next();
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
