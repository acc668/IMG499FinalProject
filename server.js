const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const gameRooms = new Map();
const app = express();
const server = app.listen(3000);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

class GameRoom {
  constructor(roomId) {
    this.id = roomId;
    this.players = new Map();
    this.fogOfWar = {
      enabled: true,
      revealedAreas: []
    };
    this.state = new (require('./sports.js').SportsGameState());
  }

  revealArea(x, y, radius) {
    this.fogOfWar.revealedAreas.push({ x, y, radius });
    io.to(this.id).emit('fogUpdate', this.fogOfWar);
  }
}

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('createRoom', (sportType) => {
    const roomId = generateRoomId();
    const room = new GameRoom(roomId);
    room.state.setSport(sportType);
    gameRooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
  });

  socket.on('joinRoom', (roomId) => {
    const room = gameRooms.get(roomId);
    if (room) {
      socket.join(roomId);
      socket.emit('roomJoined', {
        state: room.state,
        fog: room.fogOfWar
      });
    } else {
      socket.emit('roomError', 'Room not found');
    }
  });

  socket.on('revealArea', (data) => {
    const room = gameRooms.get(data.roomId);
    if (room && room.players.get(socket.id).isGM) {
      room.revealArea(data.x, data.y, data.radius);
    }
  });

  socket.on('tokenMove', (data) => {
    const token = gameState.tokens.find(t => t.id === data.id);
    if(token) {
      token.x = data.x;
      token.y = data.y;
      io.emit('gameUpdate', gameState);
    }
  });

  socket.on('diceRoll', (data) => {
    io.emit('diceResult', data);
  });
});


function generateRoomId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}
