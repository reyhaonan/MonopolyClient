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
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import TradeSection from "../organisms/TradeSection";
import type { ColorGroup } from "@/enums/ColorGroup";
import type { CountrySpace } from "@/types/BoardSpace";

type Props = {
  gameId: string;
};

const MIN_PLAYER = 2
const MAX_PLAYER = 8

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
    buyProperty,
    sellProperty,
    upgradeProperty,
    downgradeProperty,
    mortgageProperty,
    unmortgageProperty,
    initiateTrade,
    negotiateTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    gameState: {
      board,
      currentPhase,
      currentPlayer,
      currentPlayerSpace,
      currentPlayerIndex,
      activePlayers,
      diceRoll1,
      diceRoll2,
      activeTrades
    } } = useGameManager(data?.data, playerId || undefined);

  const isInGame = activePlayers.findIndex(p => p.id === playerId) !== -1

  const isMyTurn = currentPlayer?.id === playerId


  const [tileHeight, setTileHeight] = useState(0)
  const [tileWidth, setTileWidth] = useState(0)


  const tileRef = useRef<HTMLDivElement>(null)


  useLayoutEffect(() => {
    function updateSize() {
      setTileHeight(tileRef.current?.getBoundingClientRect().height || 160);
      setTileWidth(tileRef.current?.getBoundingClientRect().width || 160);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);


  const countryGroupData = useMemo(() => {
    const countrySpaces = board.spaces.filter(property => property.$type === "country");

    return countrySpaces.reduce((prev, c) => {
      if (prev[c.group]) prev[c.group].push(c)
      else prev[c.group] = [c]
      return prev
    }, {} as Record<ColorGroup, CountrySpace[]>)
  }, [board.spaces]);

  return <main className="container mx-auto flex gap-4 pb-16">
    <div className="flex-1 flex flex-col gap-4">
      <div>
        Game Phase: <span className="badge badge-warning mb-2">{GamePhase[currentPhase]}</span><br />
      </div>
      <PlayersInfo players={activePlayers} currentPlayerIndex={currentPlayerIndex} />
    </div>
    <div className="relative">
      <Board
        countryGroupData={countryGroupData}
        isPermittedToBuyOrSellProperty={isMyTurn && (currentPhase === GamePhase.PostLandingActions || currentPhase === GamePhase.PlayerTurnStart)}
        spaces={board.spaces}
        currentPlayerMoney={currentPlayer?.money}
        diceRoll={{
          roll1: diceRoll1,
          roll2: diceRoll2,
        }}
        tileActions={{
          sellProperty,
          upgradeProperty,
          downgradeProperty,
          mortgageProperty,
          unmortgageProperty,
        }}
        actionButtons={{
          joinGameButton:
            activePlayers.length < MAX_PLAYER && currentPhase === GamePhase.WaitingForPlayers && !isInGame ?
              <Button
                className="btn btn-primary"
                onClick={() => joinGame(getCookie("Username"))}
              >
                Join Game
              </Button> : null
          ,
          rollDiceButton:
            isMyTurn && currentPhase === GamePhase.PlayerTurnStart ?
              <Button
                className="btn btn-primary"
                onClick={() => rollDice()}
              >
                Roll za Dice
              </Button> : null
          ,
          endTurnButton: isMyTurn && currentPhase === GamePhase.PostLandingActions ?
            <Button
              className="btn btn-primary"
              onClick={() => endTurn()}
            >
              End Turn
            </Button> : null
          ,
          startGameButton:
            activePlayers.length >= MIN_PLAYER && isInGame && currentPhase === GamePhase.WaitingForPlayers ?
              <Button
                className="btn btn-primary"
                onClick={() => startGame()}
              >
                Start Game
              </Button> : null
          ,
          buyPropertyButton:
            isMyTurn && (currentPhase === GamePhase.PostLandingActions || currentPlayer.consecutiveDoubles > 0) && currentPlayerSpace && currentPlayerSpace.$type !== "special" && !currentPlayerSpace.ownerId ?
              <Button
                className="btn btn-primary"
                onClick={() => buyProperty()}
                disabled={currentPlayerSpace.purchasePrice > currentPlayer.money}
              >
                Buy Property
              </Button> : null

        }}
      />
      <PlayersPawns currentPlayerIndex={currentPlayerIndex} tileHeight={tileHeight} tileWidth={tileWidth} players={activePlayers} />
    </div>

    <div className="flex-1 flex flex-col gap-4">
      <TradeSection
        countryGroupData={countryGroupData}
        disableTrade={!isInGame || activePlayers.length < MIN_PLAYER || currentPhase === GamePhase.WaitingForPlayers}
        players={activePlayers}
        activeTrades={activeTrades}
        spaces={board.spaces}
        onInitiateTrade={
          ({
            recipientId,
            offer,
            counterOffer,
            moneyFromInitiator,
            moneyFromRecipient
          }) =>
            initiateTrade(recipientId, offer, counterOffer, moneyFromInitiator, moneyFromRecipient)
        }
        onNegotiateTrade={
          ({
            offer,
            counterOffer,
            moneyFromInitiator,
            moneyFromRecipient,
            tradeId
          }) =>
            negotiateTrade(tradeId, offer, counterOffer, moneyFromInitiator, moneyFromRecipient)
        }
        onAcceptTrade={acceptTrade}
        onRejectTrade={rejectTrade}
        onCancelTrade={cancelTrade}
      />
    </div>
    {/* As a reference */}
    <div className="aspect-[21/34] fixed bottom-0 left-0 -z-50 w-fit opacity-0" ref={tileRef}>PHROLOVA</div>
  </main>;
};
