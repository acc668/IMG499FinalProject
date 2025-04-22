function updateUIForSport(sport) {
    // Hide all sport-specific elements
    document.querySelectorAll('[data-sport]').forEach(el => {
      el.style.display = 'none';
    });
    
    // Show elements for current sport
    document.querySelectorAll(`[data-sport="${sport}"]`).forEach(el => {
      el.style.display = '';
    });
    
    // Update controls
    const controls = {
      volleyball: ['serve', 'spike', 'dig', 'block'],
      baseball: ['pitch', 'bat', 'steal', 'catch']
    };
    
    const controlPanel = document.querySelector('.game-controls');
    controlPanel.innerHTML = controls[sport].map(action => 
      `<button class="btn-action" data-action="${action}">${action}</button>`
    ).join('');
  }