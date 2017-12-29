var HashMap = require('hashmap')
var MessageFormatter = require('./messages/messageFormatter.js')
var User = require('./user.js');
var Room = require('./room.js');

class ChatManager{
  
  constructor(){
    // key: username, value: socket
    this.userMap = new HashMap();
    // key: roomname, value: room
    this.roomMap = new HashMap();
  }
  
  // check if socket has registered (by checking socket.user property
  // if it registered, intertpret the data sent by user
  // else try to setup the user with a username
  processRequest(socket, data){
    var user = socket.user;
    if(user){
      this.interpretData(socket, data);
    }
    else{
      this.setupUser(data, socket);
    }
  }
  
  sendMessage(username, data){
    var message = MessageFormatter.formatMessage(username, data);
    this.broadcastMessage(message);
  }
  
  sendRoomMessage(roomname, username, data){
    var message = MessageFormatter.formatMessage(username, data);
    this.broadcastRoomMessage(roomname, message);
  }
  
  sendPrivateMessage(senderName, recipientName, data){
    var message = MessageFormatter.formatPrivateMessage(senderName, data);
    
    var recipientSocket = this.userMap.get(recipientName);
    var senderSocket = this.userMap.get(senderName);
    
    if(recipientSocket){
      this.writeLine(recipientSocket, message);
      this.writeLine(senderSocket, message);
    }
    else{
      this.writeLine(senderSocket, 'The user ' + recipientName + ' does not exist');
    }
    
  }
  
  broadcastRoomMessage(roomname, message){
    var room = this.roomMap.get(roomname);
    // get all the user sockets of the room
    // and send the message
    room.users.forEach( user => {
      var username = user.name;
      var socket = this.userMap.get(username);
      this.writeLine(socket, message);
    })
  }
  
  broadcastMessage(message){
    // Value: socket, Key: socketUsername
    this.userMap.forEach((socket, username) => {
      this.writeLine(socket, message);
    });
  }
  
  addUser(username, socket){
    if(this.userMap.has(username)){
      return
    }
    else{
      this.userMap.set(username, socket);
    }
    
    //console.log(this.userMap.size);
  }
  
  hasUser(username){
    return this.userMap.has(username);
  }
  
  addRoom(username, roomname){
    var socket = this.userMap.get(username);
    if(socket){
      
      if(this.roomMap.has(roomname)){
        this.writeLine(socket, 'room already exists');
      }
      else{
        this.writeLine(socket, roomname + ' room created!');
      }
    }
    
  }
  
  createEmptyRoom(roomname){
    var emptyRoom = new Room(roomname);
    this.roomMap.set(roomname, emptyRoom);
  }
  
  removeRoom(roomname){
    this.roomMap.delete(roomname);
  }
  
  // Commands
  listRooms(socket){
    this.roomMap.forEach((room, roomname) => {
      this.writeLine(socket, '* ' + roomname + ' ('+ room.users.length + ')' );
    });
  }
  
  joinRoom(socket, roomname){
    // status
    this.writeLine(socket, 'entering room: '+ roomname);
    
    var room = this.roomMap.get(roomname);

    if(room){
      var userRoom = socket.user.location;
      if(userRoom){
        var oldRoom = this.roomMap.get(userRoom);
        oldRoom.removeUser(socket.user);
      }
      var msg = "* new user joined chat: " + socket.user.name;
      this.broadcastRoomMessage(roomname, msg);
      room.addUser(socket.user);
      this.listRoomOccupants(socket, room);
      
    }
    else {
      this.writeLine(socket, 'room ' + '[' + roomname + ']' + 'does not exist');
    }
  }
  
  leaveRoom(socket, roomname){
    var room = this.roomMap.get(roomname);
    if(room){
      var currentUser = socket.user;
      
      room.users.forEach(user => {
        var roomOccupant = this.userMap.get(user.name);
        if(roomOccupant === socket){
          this.writeLine(roomOccupant, "* user has left "+ roomname + ': ' + currentUser.name  + " (** this is you)");

        }
        else{
          this.writeLine(roomOccupant, "* user has left "+ roomname + ': ' + currentUser.name );
        }
      })
      
      //this.broadcastRoomMessage(roomname, "* user has left "+ roomname + ': ' + currentUser.name);
      room.removeUser(currentUser);
    }
    else{
      this.writeLine(socket, "you are not in a room/the room no longer exists");
    }
  }
  
  listRoomOccupants(socket, room){
    room.users.forEach( user => {
        if(user === socket.user){
          this.writeLine(socket, '* ' + user.name + " (** this is you) ");
        }
        else{
          this.writeLine(socket, '* ' + user.name);
        }
        
      });
  }
  
  quit(socket){
    this.removeUser(socket.user);
    this.writeLine(socket, "BYE");
    socket.destroy();
  }
  
  
  removeUser(user){
    if(user){
      var room = this.roomMap.get(user.location);
      if(room){
        var socket = this.userMap.get(user.name);
        this.leaveRoom(socket, room.name);
      }
      this.userMap.remove(user.name);
    }
  }
  
  clearSocketData(socket){
    var user = socket.user;
    this.removeUser(user);
  }
  
  // this will determine whether the data/text is a command/message
  interpretData(socket, data){
    var user = socket.user;
    
    if(this.isCommand(data)){
      this.executeCommand(socket, data)
    }
    else{
      // var user = socket.user;
      if(user.inRoom()){
        this.sendRoomMessage(user.location, user.name, data);
      }
      else{
        // Prompt the user to join a room
        this.writeLine(socket, "Please enter a room before chatting - type '/help' for a list of available commands");
        //this.sendMessage(user.name, data);
      }
      
    }
    
  }
  
  isCommand(data){
    return data.match("^/");
  }
  
  listCommands(socket){
    var listRooms = "/rooms - lists rooms";
    var joinRoom = "/join <roomname> - joins the room, <roomname>";
    var leaveRoom = "/leave - leaves the room";
    var quit = "/quit - terminate TCP connection with application";
    var privateMsg = "/p <recipient-username> <message> - sends a private message to user";
    var help = "/help - list available commands"
    
    this.writeLine(socket, listRooms);
    this.writeLine(socket, joinRoom);
    this.writeLine(socket, leaveRoom);
    this.writeLine(socket, quit);
    this.writeLine(socket, privateMsg);
    this.writeLine(socket, help);
    /*
    this.writeLine(socket, 
      listRooms + "\n" +
      joinRoom + "\n" +
      leaveRoom + "\n" +
      quit + "\n" +
      privateMsg + "\n" +
      help
    );
    */
  }
  // if the userusername already exists,
  // ask for another userusername
  // else register the socket with the userusername 
  // and add the socket to chatManager
  setupUser(username, socket){

    if(this.hasUser(username)){
      // console.log('user found');
      this.writeLine(socket, 'Sorry, username taken.');
      this.writeLine(socket, "Login Name?" );
    }
    else if(username.includes(" ")){
      this.writeLine(socket, 'Sorry, a username cannot cointain spaces.');
      this.writeLine(socket, "Login Name?");
    }
    else{
      var location = '';
      var newUser = new User(username, location);
      socket.user = newUser;
      
      this.addUser(username, socket);
      
      this.writeLine(socket, "Welcome " +socket.user.name + "!" );
    }
    
  }
  
  executeCommand(socket, command){
    
    if(command.match("^/rooms$")){
      this.listRooms(socket);
    }
    else if(command.match("^/join ")){
      // get the roomname
      var roomname = command.replace("/join ","");
      this.joinRoom(socket, roomname);
    }
    else if(command.match("^/leave$")){
      this.leaveRoom(socket, socket.user.location);
    }
    else if(command.match("^/quit$")){
      this.quit(socket);
    }
    else if(command.match("^/p ")){
      
      var data = command.split(" ", 2);
      var recipient = data[1];
      var message = command;
      if(recipient){
        // strip data parameters from message
        data.forEach( (param) => {
          // console.log(param);
          var replace = param+" "
          message = message.replace(replace, "");
        });
        
        this.sendPrivateMessage(socket.user.name, recipient, message);
      }
      else{
        this.writeLine(socket, "Please enter the recipient's username ");
      }
      
    }
    else if(command.match("^/help$")){
      this.listCommands(socket);
    }
    else{
      var info = "'" + command + "' "+ "is an invalid command. Type '/help' for a list of available commands";
      this.writeLine(socket, info);
    }
    
  }
  
  
  
  writeLine(socket, data){
    socket.write(data + "\n");
  }
  
  //gets
  getUserSize(){
    return this.userMap.size;
  }
  
  getRoomSize(){
    return this.roomMap.size;
  }
  
}

module.exports = ChatManager;