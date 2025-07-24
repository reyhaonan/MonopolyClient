declare type RollResult = {
  dice: DiceInfo;
  playerState: PlayerStateInfo;
};

type DiceInfo = {
  roll1: number;
  roll2: number;
  totalRoll: number;
};

type PlayerStateInfo = {
  isInJail: boolean;
  newPlayerPosition: number;
  newPlayerMoney: number;
  newPlayerJailTurnsRemaining: number;
};
