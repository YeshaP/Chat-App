const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('.'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});



http.listen(3000, () => {
  console.log('listening on *:3000');
});

// https://stackoverflow.com/questions/44367790/replace-string-with-emoji?fbclid=IwAR0LSretg9Ym9kdTHfgSMUtaQztAeJUopNFW6jnk4lMdMwHX94UncSEz2KI
function convertEmoji(to_replace,str,hex) {
  return str.replace(to_replace,String.fromCodePoint(Number.parseInt(hex, 16)));
}

// https://www.sitepoint.com/community/t/how-to-check-if-string-is-hexadecimal/162739/5
function isHex(h) {
  var a = parseInt(h,16);
  return (a.toString(16) === h)
}


var count_name = 0

var history = []
var userHistory = []

io.on('connection', (socket) => {
  count_name = count_name+1
  var userName = "User "+count_name+ " "
  var userUsage = "Your username is: "+userName
  console.log(userName + 'connected');

if(userHistory.length>200){
  userHistory.shift();
}

  if (userHistory.includes(userName) == false){
    userHistory.push(userName);
  }



  socket.emit("user name", userName);
  socket.emit("chat message", userUsage);

  socket.emit("history message", history);
  io.emit('users online', userHistory);

  socket.on('chat message', (msg) => {

    var str = ""
    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var seconds = currentTime.getSeconds()

    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    str += hours + ":" + minutes + ":" + seconds + " ";

    console.log(msg)
    if (msg.includes(':)')){
      to_replace = ':)'
      hex = '1F601';
      msg = convertEmoji(to_replace,msg,hex);
    }

    if (msg.includes(':(')){
      to_replace = ':('
      hex = '1F641';
      msg = convertEmoji(to_replace,msg,hex);
    }

    if (msg.includes(':O')){
      to_replace = ':O'
      hex = '1F632';
      msg = convertEmoji(to_replace,msg,hex);
    }


    if (msg.includes('/name')){
      newUserName = msg.split('/name ')[1];
      if (newUserName !== ""){
        if (userHistory.includes(newUserName)){
          msg = 'User name already taken'
        }else{
          if(userHistory.includes(userName)){
            var index = userHistory.indexOf(userName);
            userHistory[index] = newUserName
          }
            userName = newUserName;
            socket.emit("user name", userName);
            io.emit('users online', userHistory);
          }
      }else{
        msg = 'Bad input command';
      }
      console.log(newUserName)
      }


      if (msg.includes('/color')){
        newColor = msg.split('/color ')[1]
        if(newColor != "" && newColor.includes('#')){
          checkColor = newColor.split("#")[1];
          if (isHex(checkColor) && checkColor.length ===6){
            socket.emit("user color",newColor);
          }else{
            msg = 'Bad input command';
          }
        }else{
          msg = 'Bad input command';
        }
      }

    msg = str+userName+ " "+msg
    io.emit("user writer",userName);
    console.log('message: ' +msg);
    io.emit('chat message', msg);
    history.push(msg);

  });

  socket.on('disconnect', () => {
    console.log(userName+' disconnected');
    for (var i = 0; i <userHistory.length; i++) {
      if (userHistory[i] === userName) {
        userHistory.splice(i, 1);
      }
    }
    io.emit('users online', userHistory);
  });

});

io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

io.on('connection', (socket) => {
  socket.broadcast.emit('hi');
});
