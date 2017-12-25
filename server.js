var net = require("net");

var sockets = [];

var chatServer = net.createServer();

chatServer.on('connection', (socket) => {
    console.log('connection established');
    
    sockets.push(socket);
    
    socket.on('data', function(data){
        console.log(data);
        
        for(var i=0; i<sockets.length; i++){
            sockets[i].write(data);
        }
    });
})

chatServer.listen(process.env.PORT);

console.log('chat server on: '+ process.env.IP + ':' + process.env.PORT);