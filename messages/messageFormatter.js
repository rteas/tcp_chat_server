class MessageFormatter{
  
  static formatMessage(username, content){
    return username + ': ' + this.formatEmoji(content);
  }
  
  static formatPrivateMessage(username, content){
    return '[Private] ' + username + ': ' + content;
  }
  
  static formatEmoji(content){
    content =  content.replace(/:\)/g, "😊");
    
    return content;
  }
  
}

module.exports = MessageFormatter;