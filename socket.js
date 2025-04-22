const socket = io();

// Token Movement Sync
function initTokenDrag(token) {
  token.element.addEventListener('mousedown', (e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    
    function moveHandler(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      socket.emit('tokenMove', {
        id: token.id,
        x: token.x + dx,
        y: token.y + dy
      });
    }

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', moveHandler);
    }, { once: true });
  });
}

// Receive game state updates
socket.on('gameUpdate', (state) => {
  gameState = state;
  redrawTokens();
});
