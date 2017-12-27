var net = require("net");
var Room = require('./room');

var chatServer = net.createServer();
var ChatManager = require('./chatManager');
var chatManager = new ChatManager();
var User = require('./user.js');

chatManager.createEmptyRoom('chat');
chatManager.createEmptyRoom('hottub');

chatServer.on('connection', (socket) => {
    
    socket.setEncoding('utf8');
    
    socket.write("Welcome to the GungHo test chat server\n");
    socket.write("Login name?\n");
    
    socket.on('data', (data) => {
        // check if socket has registered (by checking socket.user property
        // if it registered, intertpret the data sent by user
        // else try to setup the user with a username
        var user = socket.user;
        if(user){
            data = data.trim();
            chatManager.interpretData(socket, data);
        }
        else{
            var username = data.trim();
            chatManager.setupUser(username, socket);
        }
        
    });
   
    socket.on('end', () => {
        var user = socket.user;
        if(user){
            chatManager.disconnect(socket);
        }
    });
    
     socket.on('error', (exception) => {
        console.log(exception);
    });
    
})

chatServer.listen(process.env.PORT);

var logBuffer = function(buffer){
    console.log(buffer.toString('utf8'));
}

console.log('chat server on: '+ process.env.IP + ':' + process.env.PORT);
