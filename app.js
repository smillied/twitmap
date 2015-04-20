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

io.use(function(socket, next) {
  //Get bounding box from browser
  var boundingBox = socket.request._query;

  //Craft locations param from bvounding box
  var param = {locations: boundingBox.swlng + ', ' + boundingBox.swlat + ', ' + boundingBox.nelng + ', ' + boundingBox.nelat};

  twit.stream('statuses/filter', param,  function(stream){
    stream.on('data', function(data) {
      console.log(data.text);

      //Turns out the API will stream tweets that,
      // a) have no coordinates
      // b) have coordinates outside the bounding box
      if(data.coordinates != null && containsCoordinates(boundingBox, data.coordinates.coordinates)) {
        
        //Emit tweet data back to browser
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

//Load index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
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
