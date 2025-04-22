class VolleyballGame extends SportsGameState {
  constructor() {
    super();
    this.setSport('volleyball');
    this.rules = {
      pointsToWin: 25,
      winBy: 2,
      maxSets: 3,
      rotationOrder: true
    };
    this.setsWon = { home: 0, away: 0 };
    this.currentSet = 1;
    this.currentRotation = 0;
    this.serveTeam = 'home';
  }

  scorePoint(team) {
    this.score[team]++;

    if (team !== this.serveTeam) {
      this.rotatePlayers(team);
      this.serveTeam = team;
    }

    if (this.score[team] >= this.rules.pointsToWin &&
        Math.abs(this.score.home - this.score.away) >= this.rules.winBy) {
      this.setsWon[team]++;
      this.newSet();
        }
        this.updateScoreDisplay();
  }

  rotatePlayers(team) {
    if (!this.rules.rotationOrder) return;

    this.currentRotation = (this.currentRotation + 1) % 6;
    const teamPlayers = this.players.filter(p => p.team === team);

    teamPlayers.forEach((player, i) => {
      const newPos = (i + this.currentRotation) % 6;
      player.position = ['FrontLeft', 'FrontCenter', 'FrontRight', 
        'BackRight', 'BackCenter', 'BackLeft'][newPos];
    });
  }
}


class BaseballGame extends SportsGameState {
  constructor() {
    super();
    this.setSport('baseball');
    this.rules = {
      innings: 9,
      outsPerInning: 3,
      strikesForOut: 3,
      ballsForWalk: 4
    };
    this.currentInning = 1;
    this.outs = 0;
    this.strikes = 0;
    this.balls = 0;
    this.bases = [false, false, false];
  }

  handleAtBat(pitcher, batter) {
    const pitchRoll = pitcher.stats.str + Math.floor(Math.random() * 20) + 1;
    const batRoll = batter.stats.agi + Math.floor(Math.random() * 20) + 1;
    const diff = batRoll - pitchRoll;

    if (diff > 5) return 'hit';
    if (diff > 0) return 'foul';
    if (diff > -5) return 'strike';
    return 'ball';
  }

  advanceRunners(hitType) {
    switch(hitType) {
      case 'single':
        this.bases = [true, this.bases[0], this.bases[1]];
        break;
      case 'double':
        this.bases = [false, true, this.bases[0]];
        break;
      case 'triple':
        this.bases = [false, false, true];
        break;
      case 'homerun':
        this.bases = [false, false, false];
        break;
    }
  }
}
