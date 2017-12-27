class MessageFormatter{
  
  static formatMessage(username, content){
    return username + ': ' + this.formatEmoji(content);
  }
  
  static formatPrivateMessage(username, content){
    return '[Private] ' + username + ': ' + this.formatEmoji(content);
  }
  
  static formatEmoji(content){
    content = content.replace(/:\)/g, "😊");
    content = content.replace(/:(p|P)/g, "😋");
    content = content.replace(/;\)/g, "😉");
    content = content.replace(/:D/g, "😄");
    content = content.replace(/:'\(/g, "😢");
    content = content.replace(/:\(/g, "😒");
    return content;
  }
  
}

module.exports = MessageFormatter;