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
  wasJailed: boolean;
  newPlayerPosition: number;
  newPlayerMoney: number;
};
