class RoomManager {
    constructor() {
      this.currentRoom = null;
      this.isGM = false;
      this.socket = io();
      this.setupSocketListeners();
    }
  
    setupSocketListeners() {
      this.socket.on('roomCreated', (roomId) => {
        this.currentRoom = roomId;
        this.isGM = true;
        showLobby(true);
      });
  
      this.socket.on('roomJoined', (data) => {
        gameState = data.state;
        initFogOfWar(data.fog);
        redrawTokens();
      });
  
      this.socket.on('fogUpdate', (fogData) => {
        updateFogOfWar(fogData);
      });
    }
  
    createRoom(sportType) {
      this.socket.emit('createRoom', sportType);
    }
  
    joinRoom(roomId) {
      this.socket.emit('joinRoom', roomId);
    }
  }
