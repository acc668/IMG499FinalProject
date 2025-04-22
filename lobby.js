const roomManager = new RoomManager();

document.getElementById('create-room-btn').addEventListener('click', () => {
  const sportType = document.getElementById('sport-select').value;
  roomManager.createRoom(sportType);
});

document.getElementById('join-room-btn').addEventListener('click', () => {
  const roomId = document.getElementById('room-code').value.trim().toUpperCase();
  if (roomId) {
    roomManager.joinRoom(roomId);
  }
});

function showLobby(isGM) {
  const lobby = document.getElementById('lobby');
  lobby.style.display = 'block';
  
  if (isGM) {
    const gmControls = document.createElement('div');
    gmControls.className = 'gm-controls';
    gmControls.innerHTML = `
      <h3>GM Controls</h3>
      <label>
        <input type="checkbox" id="fog-toggle" checked> Fog of War
      </label>
    `;
    document.body.appendChild(gmControls);
    
    document.getElementById('fog-toggle').addEventListener('change', (e) => {
      roomManager.socket.emit('toggleFog', {
        roomId: roomManager.currentRoom,
        enabled: e.target.checked
      });
    });
  }
}
