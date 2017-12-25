class MessageFormatter{
  
  static formatMessage(username, content){
    return username + ': ' + content;
  }
  
  static formatPersonalMessage(username, content){
    return '[Private] ' + username + ': ' + content;
  }
  
}

module.exports = MessageFormatter;