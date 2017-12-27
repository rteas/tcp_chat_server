class User{
  
  constructor(name, location){
    this.name = name;
    this.location = location;
  }
    
  inRoom(){
    return (this.location !== '');
  }
}

module.exports = User;