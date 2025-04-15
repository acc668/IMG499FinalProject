// ---------- ai.js (fixed) ----------
class SportsAI {
  constructor(gameState, difficulty = 'medium') {
    this.gameState = gameState;
    this.difficulty = difficulty;
    this.difficultyModifiers = { easy: 0.8, medium: 1, hard: 1.2 };
  }

  generateVolleyballActions(player) {
    const actions = [];

    switch (player.position) {
      case 'Outside Hitter':
        actions.push({
          type: 'spike',
          weight: 1.4 * this.difficultyModifiers[this.difficulty],
          statCheck: 'str+jmp'
        });
        break;

      case 'Libero':
        actions.push({
          type: 'dig',
          weight: 1.2 * this.difficultyModifiers[this.difficulty],
          statCheck: 'agi+init'
        });
        break;
    }
    return actions;
  }

  generateBaseballActions(player) {
    if (player.position === 'Pitcher') {
      return [{
        type: 'curveball',
        weight: 1.3 * this.difficultyModifiers[this.difficulty],
        statCheck: 'str+act'
      }];
    }
    return [];
  }
}
