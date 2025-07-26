export type RollResult = {
  dice: DiceInfo;
  playerState: PlayerStateInfo;
};

interface DiceInfo {
  roll1: number;
  roll2: number;
  totalRoll: number;
}

interface PlayerStateInfo {
  isInJail: boolean;
  newPlayerPosition: number;
  newPlayerMoney: number;
  newPlayerJailTurnsRemaining: number;
}
