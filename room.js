// I'll use an array to just show an alternative besides the map implementation
// (which would have been used for the users/rooms in 'chatManager.js')
var User = require('./user.js');

class Room{
  // initialize room with name and users
  constructor(name){
    this.name = name;
    this.users = [];
  }
  
  removeUser(user){
    var i = this.users.indexOf(user);
    if(i > -1){
      user.location = '';
      this.users.splice(i, 1);
      return true;
    }
    return false;
  }
  
  addUser(user){
    var i = this.users.indexOf(user);
    if(i > -1){
      return false;
    }
    user.location = this.name;
    this.users.push(user);
    return true;
  }
  
}

module.exports = Room;