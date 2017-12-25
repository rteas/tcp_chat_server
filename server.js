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
        // check if socket has registered, else try and register the socket
        // socket.user is a property that contains the user (created on chatManager)
        var user = socket.user;
        if(user){
            var username = user.name;
            data = data.trim();
            chatManager.interpretData(username, data);
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
