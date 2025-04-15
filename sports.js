// ---------- sports.js (fixed) ----------
class VolleyballGame extends SportsGameState {
  constructor() {
    super();
    this.setSport('volleyball');
    this.rules = {
      pointsToWin: 25,
      winBy: 2,
      maxSets: 3
    };
    this.setsWon = { home: 0, away: 0 };
    this.currentSet = 1;
  }

  scorePoint(team) {
    this.score[team]++;

    if (this.score[team] >= this.rules.pointsToWin &&
        Math.abs(this.score.home - this.score.away) >= this.rules.winBy) {
      this.setsWon[team]++;
      this.newSet();

      if (this.setsWon[team] >= this.rules.maxSets) {
        this.endMatch(team);
      }
    }
    this.updateScoreDisplay();
  }

  newSet() {
    this.currentSet++;
    this.score = { home: 0, away: 0 };
  }
}

class BaseballGame extends SportsGameState {
  constructor() {
    super();
    this.setSport('baseball');
    this.rules = {
      innings: 9,
      outsPerInning: 3
    };
    this.currentInning = 1;
    this.outs = 0;
  }

  handleAtBat(pitcher, batter) {
    const pitchRoll = pitcher.stats.str + Math.floor(Math.random() * 20) + 1;
    const batRoll = batter.stats.agi + Math.floor(Math.random() * 20) + 1;
    return batRoll > pitchRoll;
  }
}
