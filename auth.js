class AuthSystem {
    constructor() {
      this.users = JSON.parse(localStorage.getItem('ttrpg-users')) || {};
    }
  
    register(username, password, email, position) {
      if (this.users[username]) return false;
      
      this.users[username] = {
        password,
        email,
        position,
        characters: []
      };
      localStorage.setItem('ttrpg-users', JSON.stringify(this.users));
      return true;
    }
  
    login(username, password) {
      const user = this.users[username];
      return user && user.password === password ? user : null;
    }
  }