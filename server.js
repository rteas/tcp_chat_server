var net = require("net");
var Room = require('./room');

var chatServer = net.createServer();
var ChatManager = require('./chatManager');
var chatManager = new ChatManager();
var User = require('./user.js');

/*
chatManager.createEmptyRoom('chat');
chatManager.createEmptyRoom('hottub');
*/

chatServer.on('connection', (socket) => {
    
    socket.setEncoding('utf8');
    
    socket.write("Welcome to the GungHo test chat server\n");
    socket.write("Login Name?\n");
    
    socket.on('data', (data) => {
        data = data.trim();
        chatManager.processRequest(socket, data);
    });
   
    socket.on('end', () => {
        chatManager.clearSocketData(socket);
    });
    
     socket.on('error', (exception) => {
        console.log(exception);
    });
    
})

var port = process.env.PORT || 8080;
var ip = process.env.IP || "0.0.0.0";
chatServer.listen(port, ip);

var logBuffer = function(buffer){
    console.log(buffer.toString('utf8'));
}

console.log('chat server on: '+ ip + ':' + port);
