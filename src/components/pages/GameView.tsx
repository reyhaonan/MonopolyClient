import { useAuth } from "@/hooks/useAuth";
import useGameManager from "@/hooks/useGameManager";
import * as GameAPI from "@/services/game";
import { useQuery } from "@tanstack/react-query";
import Board from "../organisms/Board";
import Button from "../atoms/Button";
import { getCookie } from "@/utils/cookie";
import { GamePhase } from "@/enums/GamePhase";
import PlayersInfo from "../organisms/PlayersInfo";
import PlayersPawns from "../organisms/PlayersPawns";
import { useLayoutEffect, useRef, useState } from "react";

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
    } } = useGameManager(data?.data, playerId || undefined);

  const isInGame = activePlayers.findIndex(p => p.id === playerId) !== -1

  const isMyTurn = currentPlayer?.id === playerId


  const [tileHeight, setTileHeight] = useState(0)
  const [tileWidth, setTileWidth] = useState(0)
  const [boardSize, setBoardSize] = useState(0)


  const tileRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)


  useLayoutEffect(() => {
    function updateSize() {
      setTileHeight(tileRef.current?.getBoundingClientRect().height || 160);
      setTileWidth(tileRef.current?.getBoundingClientRect().width || 160);
      setBoardSize(boardRef.current?.getBoundingClientRect().height || 160);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return <main className="container mx-auto flex gap-4 pb-16">
    <div className="flex-1">
      {GamePhase[currentPhase]}
      <PlayersInfo players={activePlayers} currentPlayerIndex={currentPlayerIndex} />
    </div>
    <div className="relative" ref={boardRef}>
      <Board
        board={board}
        tileHeight={tileHeight}
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
      <PlayersPawns tileHeight={tileHeight} tileWidth={tileWidth} players={activePlayers} />
    </div>
    <div className="flex-1">b</div>

    {/* As a reference */}
    <div className="aspect-[21/34] fixed bottom-0 left-0 -z-50 w-fit opacity-0" ref={tileRef}>PHROLOVA</div>
  </main>;
};
