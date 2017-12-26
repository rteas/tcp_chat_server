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
  
  sendMessage(username, data){
    var message = MessageFormatter.formatMessage(username, data);
    this.broadcastMessage(message);
  }
  
  sendRoomMessage(roomname, username, data){
    var message = MessageFormatter.formatMessage(username, data);
    this.broadcastRoomMessage(roomname, message);
  }
  
  broadcastRoomMessage(roomname, message){
    var room = this.roomMap.get(roomname);
    // get all the user sockets of the room
    // and send the message
    room.users.forEach( user => {
      var username = user.name;
      var socket = this.userMap.get(username);
      socket.write(message + '\n');
    })
  }
  
  broadcastMessage(message){
    // Value: socket, Key: socketUsername
    this.userMap.forEach((socket, username) => {
      socket.write(message + "\n");
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
  
  disconnect(socket){
    var user = socket.user;
    if(user){
      var room = this.roomMap.get(user.location);
      if(room){
        room.removeUser(user);
      }
      this.userMap.remove(user.name);
    }
  }
  
  hasUser(username){
    return this.userMap.has(username);
  }
  
  addRoom(username, roomname){
    var socket = this.userMap.get(username);
    if(socket){
      
      if(this.roomMap.has(roomname)){
        socket.write('room already exists')
      }
      else{
        socket.write(roomname + ' room created!');
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
    socket.write('list rooms called! \n');
    this.roomMap.forEach((room, roomname) => {
      socket.write('* ' + roomname + ' ('+ room.users.length + ')' + "\n");
    });
  }
  
  joinRoom(socket, roomname){
    // status
    socket.write('entering room: '+ roomname + "\n");
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
      socket.write('room ' + '[' + roomname + ']' + 'does not exist' + "\n");
    }
  }
  
  leaveRoom(socket, roomname){
    var room = this.roomMap.get(roomname);
    if(room){
      var currentUser = socket.user;
      
      room.users.forEach(user => {
        var roomOccupant = this.userMap.get(user.name);
        if(roomOccupant === socket){
          roomOccupant.write("* user has left "+ roomname + ': ' + currentUser.name  + " (** this is you) \n");
        }
        else{
          roomOccupant.write("* user has left "+ roomname + ': ' + currentUser.name + "\n");
        }
      })
      
      //this.broadcastRoomMessage(roomname, "* user has left "+ roomname + ': ' + currentUser.name);
      room.removeUser(currentUser);
    }
    else{
      socket.write('you are not in a room/the room no longer exists \n');
    }
  }
  
  listRoomOccupants(socket, room){
    room.users.forEach( user => {
        if(user === socket.user){
          socket.write('* ' + user.name + " (** this is you) \n");
        }
        else{
          socket.write('* ' + user.name + "\n");
        }
        
      });
  }
  
  quit(socket){
    var user = socket.user;
    this.disconnect(socket);
    socket.write("BYE \n");
    socket.destroy();
  }
  
  // this will determine whether the data/text is a command/message
  interpretData(username, data){
    var socket = this.userMap.get(username);
    if(this.isCommand(data)){
      this.executeCommand(socket, data)
    }
    else{
      var user = socket.user;
      if(user.location !== ''){
        this.sendRoomMessage(user.location, user.name, data);
      }
      else{
        this.sendMessage(username, data);
      }
      
    }
    
  }
  
  isCommand(data){
    return data.match("^/");
  }
  
  // if the userusername already exists,
  // ask for another userusername
  // else register the socket with the userusername 
  // and add the socket to chatManager
  setupUser(username, socket){

    if(this.hasUser(username)){
      // console.log('user found');
      socket.write('Sorry, username taken. \n');
      socket.write("Login username?\n");
    }
    else{
      var location = '';
      var newUser = new User(username, location);
      socket.user = newUser;
      
      this.addUser(username, socket);
      
      socket.write("Welcome " +socket.user.name + "! \n");
    }
    
  }
  
  
  
  executeCommand(socket, command){
    
    if(command.match("^/rooms$")){
      this.listRooms(socket);
    }
    if(command.match("^/join ")){
      // get the roomname
      var roomname = command.replace("/join ","");
      this.joinRoom(socket, roomname);
    }
    if(command.match("^/leave$")){
      this.leaveRoom(socket, socket.user.location);
    }
    if(command.match("^/quit$")){
      this.quit(socket);
    }
    
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