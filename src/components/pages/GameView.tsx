import { useAuth } from "@/hooks/useAuth";
import useGameHub from "@/hooks/useGameHub";
import * as GameAPI from "@/services/game";
import { useQuery } from "@tanstack/react-query";
import Board from "../organisms/Board";
import Button from "../atoms/Button";
import { getCookie } from "@/utils/cookie";
import { GamePhase } from "@/enums/GamePhase";
import PlayersInfo from "../organisms/PlayersInfo";

type Props = {
  gameId: string;
};

export const GameView = ({ gameId }: Props) => {
  const { data } = useQuery({
    queryKey: ["verifyGame", gameId],
    queryFn: () => GameAPI.verifyGame(gameId),
  });

  const playerId = useAuth();

  const {
    rollDice,
    joinGame,
    startGame,
    endTurn,
    gameState: {
      board,
      currentPhase,
      currentPlayer,
      currentPlayerIndex,
      activePlayers
    } } = useGameHub(data?.data, playerId || undefined);

  const isInGame = activePlayers.findIndex(p => p.id === playerId) !== -1

  const isMyTurn = currentPlayer?.id === playerId

  return <main className="container mx-auto flex gap-4 pb-16">
    <div className="flex-1">
      {GamePhase[currentPhase]}
      <PlayersInfo players={activePlayers} currentPlayerIndex={currentPlayerIndex} />
    </div>
    <div className="">
      <Board
        board={board}
        joinGameButton={
          currentPhase === GamePhase.WaitingForPlayers && !isInGame ?
            <Button
              className="btn btn-lg btn-primary"
              onClick={() => joinGame(getCookie("Username"))}
            >
              Join Game
            </Button> : null
        }
        rollDiceButton={
          isMyTurn && currentPhase === GamePhase.PlayerTurnStart ?
            <Button
              className="btn btn-lg btn-primary"
              onClick={() => rollDice()}
            >
              Roll za Dice
            </Button> : null
        }
        endTurnButton={isMyTurn && currentPhase === GamePhase.PostLandingActions ?
          <Button
            className="btn btn-lg btn-primary"
            onClick={() => endTurn()}
          >
            End Turn
          </Button> : null
        }
        startGameButton={
          isInGame && currentPhase === GamePhase.WaitingForPlayers ?
            <Button
              className="btn btn-lg btn-primary"
              onClick={() => startGame()}
            >
              Start Game
            </Button> : null
        }
      />
    </div>
    <div className="flex-1">b</div>
  </main>;
};
