// Game board setup
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const mapManager = new MapManager();


function resizeCanvas()
{
  canvas.width = window.innerWidth * 0.6;
  canvas.height = window.innerHeight * 0.8;
  mapManager.drawCurrentMap();
  drawTokens();
}


function drawGrid()
{
  const gridSize = 50;
  ctx.strokeStyle = '#ccc';

  for (let x = 0; x <= canvas.width; x += gridSize)
  {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += gridSize)
  {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#2c5f2d';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeRect(50, canvas.height / 2 - 150, 100, 300);
  ctx.strokeRect(canvas.width - 150, canvas.height / 2 - 150, 100, 300);
}


window.addEventListener('resize', resizeCanvas);
resizeCanvas();


class Token
{
  constructor(x, y, imageUrl)
  {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.image = new Image();
    this.image.src = imageUrl;
  }

  draw()
  {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.restore();

    if (this.selected)
    {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function rollDice(expression)
{
  const match = expression.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return null;

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  let total = 0;
  const rolls = [];

  for (let i = 0; i < count; i++)
  {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  total += modifier;

  return {
    expression,
    rolls,
    modifier,
    total
  };
}


class ChatSystem
{
  constructor()
  {
    this.logElement = document.querySelector('.chat-log');
  }

  addDiceRoll(rollData)
  {
    const entry = document.createElement('div');
    entry.className = `chat-entry dice-roll ${rollData.team ? `team-${rollData.team}` : ''}`;
    
    entry.innerHTML = `
    <span class="roll-announcement">
      ${rollData.characterName ? `<strong>${rollData.characterName}</strong> rolls ` : ''}
      ${rollData.expression}: 
      <span class="base-roll">${rollData.rolls.join(' + ')}</span>
      ${rollData.modifier !== 0 ? 
        `+ <span class="modifier">${rollData.modifier}</span> = 
         <span class="total">${rollData.total}</span>` 
        : `= <span class="total">${rollData.total}</span>`}
    </span>
  `;
  this.logElement.appendChild(entry);
  }
}


class DiceRoller
{
  constructor(chatSystem)
  {
    this.chatSystem = chatSystem;
    this.history = [];
    this.rollResultsElement = document.getElementById('roll-results');
  }

  roll(expression, modifier = 0)
  {
    const result = this.parseDiceExpression(expression);
    result.total += modifier;

    this.chatSystem.addDiceRoll({
      expression,
      rolls: result.rolls,
      modifier,
      total: result.total
    });

    return result.total;
  }

  parseDiceExpression(expression)
  {
    const match = expression.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) throw new Error('Invalid dice expression');

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    const rolls = Array.from({ length: count }, () =>
      Math.floor(Math.random() * sides) + 1
    );

    return {
      rolls,
      modifier,
      total: rolls.reduce((a, b) => a + b, 0) + modifier
    };
  }

  displayRollResult(result)
  {
    const entry = document.createElement('div');
    entry.className = 'roll-entry';
    entry.innerHTML = `
      <span class="dice-expression">${result.expression}</span>
      <span class="dice-result">${result.total}</span>
      <span class="dice-breakdown">(${result.rolls.join('+')}) 
        ${result.modifier >= 0 ? '+' : '-'} ${Math.abs(result.modifier)}
      </span>
    `;
    this.rollResultsElement.prepend(entry);
    this.history.unshift(result);
  }
}


class CharacterSheet
{
    constructor()
    {
      this.bindEvents();
    }
  
    bindEvents()
    {
      document.querySelectorAll('.roll-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const stat = e.target.dataset.stat;
          const value = parseInt(e.target.previousElementSibling.value) || 0;
          this.handleRoll(stat, value);
        });
      });
    }
  
    handleRoll(stat, baseValue)
    {
      const modifiers = this.getActiveModifiers();
      const rollResult = this.rollD20(modifiers);
      const total = baseValue + rollResult.total;
  
      this.displayRollResult({
        stat,
        baseValue,
        modifiers,
        roll: rollResult,
        total
      });
    }
  
    getActiveModifiers()
    {
      return Array.from(document.querySelectorAll('.modifier:checked')).map(cb => cb.value);
    }
  
    rollD20(modifiers)
    {
      let rolls = [Math.floor(Math.random() * 20) + 1];
  
      if (modifiers.includes('advantage'))
      {
        rolls.push(Math.floor(Math.random() * 20) + 1);
        rolls = [Math.max(...rolls)];
      }
  
      const baseRoll = rolls[0];
      let total = baseRoll;
  
      if (modifiers.includes('proficient')) total += 2;
      if (modifiers.includes('inspired')) total += 1;
  
      return { baseRoll, total, modifiers, rolls };
    }
  
    displayRollResult(result)
    {
      const chatEntry = document.createElement('div');
      chatEntry.className = 'chat-entry';
      chatEntry.innerHTML = `
        <strong>${result.stat.toUpperCase()} Check:</strong>
        ${result.rolls.join(' → ')} 
        (Base: ${result.baseValue} + Roll: ${result.total})
        ${result.modifiers.length ? `[${result.modifiers.join(', ')}]` : ''}
      `;
      document.querySelector('.chat-log').appendChild(chatEntry);
    }
  }
  

  class MapManager
  {
    constructor()
    {
      this.currentMap = 'soccer';
      this.maps = {
        soccer: {
          draw: this.drawSoccerField,
          gridSize: 50,
          backgroundColor: '#2c5f2d'
        },
        baseball: {
          draw: this.drawBaseballField,
          gridSize: 60,
          backgroundColor: '#2c5f2d'
        },
        volleyball: {
          draw: this.drawVolleyballCourt,
          gridSize: 40,
          backgroundColor: '#3a5fcd'
        },
        'beach-volleyball': {
          draw: this.drawBeachVolleyballCourt,
          gridSize: 40,
          backgroundColor: '#e3b778'
        }
      };
    }
  
    drawCurrentMap()
    {
      const config = this.maps[this.currentMap];
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      config.draw.call(this);
      this.drawGrid(config.gridSize);
    }
  
    drawGrid(gridSize)
    {
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
  
      for (let x = 0; x <= canvas.width; x += gridSize)
      {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
  
      for (let y = 0; y <= canvas.height; y += gridSize)
      {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  
    drawBaseballField()
    {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      const baseDistance = 200;
      const startX = canvas.width / 2 - baseDistance / 2;
      const startY = canvas.height / 2 - baseDistance / 2;
  
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + baseDistance, startY);
      ctx.lineTo(startX + baseDistance / 2, startY + baseDistance);
      ctx.closePath();
      ctx.stroke();
  
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  
    drawVolleyballCourt()
    {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
  
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 50);
      ctx.lineTo(canvas.width / 2, canvas.height - 50);
      ctx.stroke();
  
      ctx.strokeRect(100, 50, canvas.width - 200, canvas.height - 100);
    }
  
    drawBeachVolleyballCourt()
    {
      this.drawVolleyballCourt();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 100; i++)
      {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  

  class GameState
  {
    constructor()
    {
      this.players = [];
      this.aiPlayers = [];
      this.currentTurn = 0;
      this.aiEngine = new SportsAI(this);
    }
  
    setupDefaultPositions()
    {
      switch (mapManager.currentMap)
      {
        case 'baseball':
          this.setBaseballPositions();
          break;
        case 'volleyball':
        case 'beach-volleyball':
          this.setVolleyballPositions();
          break;
        default:
          this.setSoccerPositions();
      }
    }
  
    setBaseballPositions()
    {
      const baseDistance = 200;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
  
      this.players = [
        new Token(centerX - baseDistance / 2, centerY - baseDistance / 2, 'player.png'),
        new Token(centerX + baseDistance / 2, centerY - baseDistance / 2, 'player.png')
        // Add other positions as needed
      ];
    }
  
    setVolleyballPositions()
    {
      this.players = [
        new Token(canvas.width / 4, canvas.height / 2, 'player.png'),
        new Token(canvas.width * 3 / 4, canvas.height / 2, 'player.png')
        // Add other positions as needed
      ];
    }
  
    setSoccerPositions()
    {
      // Placeholder
      this.players = [
        new Token(canvas.width / 2, canvas.height / 2, 'player.png')
      ];
    }
  
    // More methods like addAICharacter, startCombat, determineTurnOrder... to be added in Part 3
  }


  class SportsGameState extends GameState {
    constructor() {
      super();
      this.score = { home: 0, away: 0 };
      this.matchTime = 0;
      this.quarterLength = 15 * 60;
      this.currentSport = 'volleyball';
    }
  
    setSport(sport) {
      this.currentSport = sport;
      updateSportDisplay(sport);
  
      if (sport === 'volleyball') {
        this.rules = { pointsToWin: 25, winBy: 2, maxSets: 3 };
        this.setsWon = { home: 0, away: 0 };
        this.currentSet = 1;
      } else {
        this.rules = { innings: 9, outsPerInning: 3 };
        this.currentInning = 1;
        this.outs = 0;
      }
  
      this.score = { home: 0, away: 0 };
      this.updateScoreDisplay();
    }
  
    updateScoreDisplay() {
      document.querySelector('[data-team="home"] .points').textContent = this.score.home;
      document.querySelector('[data-team="away"] .points').textContent = this.score.away;
  
      if (this.currentSport === 'volleyball') {
        document.querySelector('.current-set').textContent = `Set ${this.currentSet}`;
      } else {
        document.querySelector('.current-inning').textContent = `Inning ${this.currentInning}`;
      }
    }
  
    scorePoint(team) {
      this.score[team]++;
      this.updateScoreDisplay();
  
      if (this.currentSport === 'volleyball') {
        if (
          this.score[team] >= this.rules.pointsToWin &&
          Math.abs(this.score.home - this.score.away) >= this.rules.winBy
        ) {
          this.setsWon[team]++;
          this.currentSet++;
          this.score = { home: 0, away: 0 };
          this.updateScoreDisplay();
  
          if (this.setsWon[team] >= this.rules.maxSets) {
            this.endMatch(team);
          }
        }
      }
    }
  
    endInning() {
      this.currentInning++;
      if (this.currentInning > this.rules.innings) {
        this.endGame();
      } else {
        this.updateScoreDisplay();
      }
    }
  
    startMatch() {
      this.matchInterval = setInterval(() => {
        this.matchTime++;
        if (this.matchTime >= this.quarterLength) this.endQuarter();
      }, 1000);
    }
  
    executeAction(action) {
      switch (action.type) {
        case 'pass':
          return this.handlePass(action);
        case 'shoot':
          return this.handleShot(action);
      }
    }
  
    handlePass(action) {
      const successRoll = rollDice('1d20') + action.accuracy;
      return successRoll >= 15 ? 'completed_pass' : 'turnover';
    }
  
    simulateAIPlay() {
      this.aiPlayers.forEach(player => {
        const actions = this.aiEngine.generateVolleyballActions(player);
        const action = actions[Math.floor(Math.random() * actions.length)];
        this.executeAction(action);
  
        this.commentator.addCommentary(
          this.commentator.generateAICCommentary(action),
          true
        );
      });
    }
  }
  
  class CommentatorSystem {
    constructor() {
      this.logElement = document.querySelector('.commentary-log');
    }
  
    addCommentary(text, isAI = false) {
      const entry = document.createElement('div');
      entry.className = `comment ${isAI ? 'ai' : 'human'}`;
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
      this.logElement.prepend(entry);
    }
  
    generateAICCommentary(action) {
      const commentaries = {
        goal: ['What a spectacular shot!', 'Goooooooal!'],
        pass: ['Beautiful passing play!', 'Looking for options...'],
        spike: ['That spike was unstoppable!', 'Crushed it across the net!']
      };
      return commentaries[action.type]?.[Math.floor(Math.random() * 2)] || 'Nice move!';
    }
  }
  
  function updateSportDisplay(sport) {
    const indicator = document.getElementById('game-indicator');
    indicator.className = `game-indicator ${sport}-indicator`;
    indicator.textContent = sport === 'volleyball' ? 'Volleyball Match' : 'Baseball Game';
  
    const setDisplay = document.querySelector('.current-set');
    const inningDisplay = document.querySelector('.current-inning');
  
    if (sport === 'volleyball') {
      setDisplay.style.display = 'block';
      inningDisplay.style.display = 'none';
      setDisplay.textContent = 'Set 1';
    } else {
      setDisplay.style.display = 'none';
      inningDisplay.style.display = 'block';
      inningDisplay.textContent = 'Inning 1';
    }
  
    document.querySelectorAll('.points').forEach(el => {
      el.textContent = '0';
    });
  }
  
  class AccountManager {
    constructor() {
      this.currentUser = null;
      this.users = JSON.parse(localStorage.getItem('ttrpg-users')) || {};
    }
  
    login(username, password) {
      if (this.users[username] && this.users[username].password === password) {
        this.currentUser = username;
        return true;
      }
      return false;
    }
  
    signup(username, password) {
      if (!this.users[username]) {
        this.users[username] = { password: password, characters: [] };
        localStorage.setItem('ttrpg-users', JSON.stringify(this.users));
        return true;
      }
      return false;
    }
  
    saveCharacter(characterData) {
      if (this.currentUser) {
        this.users[this.currentUser].characters.push(characterData);
        localStorage.setItem('ttrpg-users', JSON.stringify(this.users));
      }
    }
  
    loadCharacters() {
      return this.currentUser ? this.users[this.currentUser].characters : [];
    }
  }


  // Initialize systems
const accountManager = new AccountManager();
const chatSystem = new ChatSystem();
const diceRoller = new DiceRoller(chatSystem);
const characterSheet = new CharacterSheet();
const gameState = new SportsGameState();
const commentator = new CommentatorSystem();
gameState.commentator = commentator;

document.getElementById('map-select').addEventListener('change', (e) => {
  const sport = e.target.value;
  mapManager.currentMap = sport;
  gameState.setSport(sport);
  updateSportDisplay(sport);
  resizeCanvas();
});

document.getElementById('start-match').addEventListener('click', () => {
  gameState.startMatch();
  window.game = gameState;
});

document.getElementById('home-score').addEventListener('click', () => {
  gameState.scorePoint('home');
});

document.getElementById('away-score').addEventListener('click', () => {
  gameState.scorePoint('away');
});

document.getElementById('next-period').addEventListener('click', () => {
  if (gameState.currentSport === 'volleyball') {
    gameState.currentSet++;
    document.querySelector('.current-set').textContent = `Set ${gameState.currentSet}`;
  } else {
    gameState.endInning();
  }
});

document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  if (accountManager.login(username, password)) {
    document.body.classList.add('logged-in');
    document.getElementById('username-display').textContent = username;
  }
});

document.getElementById('signup-btn').addEventListener('click', () => {
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  if (accountManager.signup(username, password)) {
    alert('Account created successfully!');
  }
});

document.getElementById('save-character').addEventListener('click', () => {
  const characterData = characterSheet.getData?.() || {};
  accountManager.saveCharacter(characterData);
});

document.querySelectorAll('[data-roll]').forEach(button => {
  button.addEventListener('click', (e) => {
    const rollExpression = e.target.dataset.roll;
    const modifierInput = document.getElementById(`${rollExpression}-mod`);
    const modifier = parseInt(modifierInput?.value || '0');
    diceRoller.roll(rollExpression, modifier);
  });
});

document.getElementById('roll-dice').addEventListener('click', () => {
  const expression = document.getElementById('dice-expression').value.trim();
  if (!expression) return;

  try {
    const result = diceRoller.parseDiceExpression(expression);
    result.expression = expression;

    const characterName = document.querySelector('.character-name')?.value || 'Unknown';
    const team = gameState?.activePlayer?.team || 'neutral'; // fallback if not assigned

    chatSystem.addDiceRoll({
      characterName,
      team,
      expression: result.expression,
      rolls: result.rolls,
      modifier: result.modifier,
      total: result.total
    });

    diceRoller.displayRollResult(result);
  } catch (err) {
    alert('Invalid dice expression. Use something like 1d20+2.');
  }
});