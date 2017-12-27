class MessageFormatter{
  
  static formatMessage(username, content){
    content = this.formatEmoji(content);
    return username + ': ' + content;
  }
  
  static formatPrivateMessage(username, content){
    content = this.formatEmoji(content)
    return '[Private] ' + username + ': ' + content;
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