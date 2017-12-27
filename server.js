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
    socket.write("Login Name?\n");
    
    socket.on('data', (data) => {
        data = data.trim();
        chatManager.processRequest(socket, data);
    });
   
    socket.on('end', () => {
        chatManager.clearUserData(socket);
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
