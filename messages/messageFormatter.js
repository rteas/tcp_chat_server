class MessageFormatter{
  
  static formatMessage(username, content){
    return username + ': ' + content;
  }
  
  static formatPrivateMessage(username, content){
    return '[Private] ' + username + ': ' + content;
  }
  
}

module.exports = MessageFormatter;