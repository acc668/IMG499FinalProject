class GameSession {
    constructor(sportType) {
      this.sport = sportType;
      this.players = [];
      this.events = new EventEmitter();
      this.clock = new GameClock(sportType);
    }
  
    addPlayer(player) {
      this.players.push(player);
      this.events.emit('playerJoined', player);
    }
  }
  
  class GameClock {
    constructor(sportType) {
      this.sport = sportType;
      this.interval = null;
      this.time = 0;
      this.period = 1;
      this.gameState = {
        baseball: {
          outs: 0,
          strikes: 0,
          balls: 0,
          bases: [false, false, false]
        },
        volleyball: {
          servingTeam: 'home',
          rotation: 0,
          timeouts: {
            home: 2,
            away: 2
          }
        },
        beachVolleyball: {
          servingTeam: 'home',
          rotation: 0,
          timeouts: 1,
          sideSwitch: 7
        }
      };
    }
  
    start() {
      this.interval = setInterval(() => {
        this.time++;
        this.updateGameState();
      }, 1000);
    }

    stop() {
      clearInterval(this.interval);
      this.interval = null;
    }
  
    updateGameState() {
      switch(this.sport) {
        case 'baseball':
          this.updateBaseball();
          break;
        case 'volleyball':
          this.updateVolleyball();
          break;
        case 'beachVolleyball':
          this.updateBeachVolleyball();
          break;
      }
      this.events.emit('gameUpdate', this.getState());
    }

    updateBaseball() {
      const state = this.gameState.baseball;

      if (this.time % 20 === 0) {
        this.events.emit('pitcherTimeout');
      }

      if (this.time % 180 === 0 && state.outs >= 3) {
        this.nextInning();
      }
    }

    nextInning() {
      this.period++;
      this.gameState.baseball = {
        outs: 0,
        strikes: 0,
        balls: 0,
        bases: [false, false, false]
      };
      this.events.emit('inningChange', this.period);
    }

    updateVolleyball() {
      const state = this.gameState.volleyball;

      if (this.time % 300 === 0) {
        state.rotation = (state.rotation + 1) % 6;
        this.events.emit('rotationChange', state.rotation);
      }

      if ([8, 16].includes(this.time)) {
        this.events.emit('technicalTimeout');
      }
    }

    updateBeachVolleyball() {
      const state = this.gameState.beachVolleyball;

      if (this.time % 7 === 0) {
        this.events.emit('sideSwitch');
      }

      if (this.time % 180 === 0) {
        state.rotation = (state.rotation + 1) % 2;
        this.events.emit('rotationChange', state.rotation);
      }
    }

    getState() {
      return {
        sport: this.sport,
        time: this.formatTime(),
        period: this.period,
        ...this.gameState[this.sport]
      };
    }

    formatTime() {
      const mins = Math.floor(this.time / 60);
      const secs = this.time % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }

  class EventEmitter {
    constructor() {
      this.events = {};
    }
  
    on(event, listener) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(listener);
    }
  
    emit(event, ...args) {
      if (this.events[event]) {
        this.events[event].forEach(listener => listener(...args));
      }
    }
  }