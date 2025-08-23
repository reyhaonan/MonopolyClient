import { useAuth } from "@/hooks/useAuth";
import useGameManager from "@/hooks/useGameManager";
import * as GameAPI from "@/services/game";
import { useQuery } from "@tanstack/react-query";
import Board from "../organisms/Board";
import Button from "../atoms/Button";
import { getCookie } from "@/utils/cookie";
import { GamePhase } from "@/enums/GamePhase";
import PlayersInfo from "../organisms/PlayersInfo";
import PlayersPawnsRender from "../organisms/PlayersPawnsRender";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import TradeSection from "../organisms/TradeSection";
import type { ColorGroup } from "@/enums/ColorGroup";
import type { CountrySpace } from "@/types/BoardSpace";
import TransactionHistory from "../organisms/TransactionHistory";
import type { Player } from "@/types/Player";
import classNames from "classnames";
import GameConfigForm from "../organisms/GameConfigForm";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  gameId: string;
};


const COLOR_OPTIONS = [
  "#EC3560",
  "#F8A538",
  "#F4D50D",
  "#97CD2C",
  "#33CDEC",
  "#0C7ED5",
  "#792CEC",
  "#D55DC2"
]

export const GameView = ({ gameId }: Props) => {
  const { data, error } = useQuery({
    queryKey: ["verifyGame", gameId],
    queryFn: () => GameAPI.verifyGame(gameId),
  });

  const navigate = useNavigate({ from: "/game" })

  useEffect(() => {
    if (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data)
        navigate({ to: "/" })
      }
    }
  }, [error])

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
    declareBankcruptcy,
    updateGameConfig,
    gameState: {
      board,
      currentPhase,
      currentPlayer,
      currentPlayerSpace,
      currentPlayerIndex,
      activePlayers,
      diceRoll1,
      diceRoll2,
      activeTrades,
      transactionsHistory,
      gameConfig
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


  const countryGroupDict = useMemo(() => {
    const countrySpaces = board.spaces.filter(property => property.$type === "country");

    return countrySpaces.reduce((prev, c) => {
      if (prev[c.group]) prev[c.group].push(c)
      else prev[c.group] = [c]
      return prev
    }, {} as Record<ColorGroup, CountrySpace[]>)
  }, [board.spaces]);

  const playersDict = activePlayers.reduce((prev, player) => {
    prev[player.id] = player
    return prev
  }, {} as { [key: Player['id']]: Player })

  const [selectedColor, setSelectedColor] = useState("");

  return <main className="container mx-auto flex gap-4 pb-16">
    <div className="relative">
      <Board
        tileWidth={tileWidth}
        playersDict={playersDict}
        countryGroupDict={countryGroupDict}
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
            activePlayers.length < gameConfig.maxPlayers && currentPhase === GamePhase.WaitingForPlayers && !isInGame ?
              <div className="flex flex-col items-center">
                <div className="text-xs opacity-60">Please select a color</div>
                <div className="colorSelection grid grid-cols-4 gap-2 items-center my-4">
                  {COLOR_OPTIONS.map(color =>
                    <Button
                      key={color}
                      className={
                        classNames("btn btn-circle border-0",
                          color === selectedColor && "ring-4",
                          activePlayers.some(p => p.hexColor === color) && "btn-disabled opacity-10"
                        )
                      }
                      style={{ background: color }}
                      onClick={() => setSelectedColor(color)}
                      disabled={activePlayers.some(p => p.hexColor === color)}
                    ></Button>
                  )}
                </div>
                <Button
                  className="btn btn-primary"
                  disabled={!selectedColor}
                  onClick={() => joinGame(getCookie("Username"), selectedColor)}
                >
                  Join Game
                </Button>
              </div>
              : null
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
            activePlayers.length >= gameConfig.minPlayers && isInGame && currentPhase === GamePhase.WaitingForPlayers ?
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
      <PlayersPawnsRender currentPlayerIndex={currentPlayerIndex} tileHeight={tileHeight} tileWidth={tileWidth} players={activePlayers} />
    </div>

    <div className="flex-1 flex flex-col gap-4">
      <div>
        Game Phase: <span className="badge badge-warning mb-2">{GamePhase[currentPhase]}</span><br />
      </div>
      <PlayersInfo
        players={activePlayers}
        currentPlayerIndex={currentPlayerIndex}
        isPermittedToDeclareBankcruptcy={isInGame && currentPhase !== GamePhase.WaitingForPlayers && currentPhase !== GamePhase.GameOver}
        onDeclareBankruptcy={declareBankcruptcy}
      />
      <TradeSection
        countryGroupDict={countryGroupDict}
        disableTrade={!isInGame || activePlayers.length < gameConfig.minPlayers || currentPhase === GamePhase.WaitingForPlayers}
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
      <GameConfigForm gameConfig={gameConfig} onUpdateGameConfig={updateGameConfig} disabled={!isInGame || currentPhase != GamePhase.WaitingForPlayers} />
      <TransactionHistory transactionsHistory={transactionsHistory} playersDict={playersDict} />
    </div>
    {/* As a reference */}
    <div className="aspect-[21/34] fixed bottom-0 left-0 -z-50 w-fit opacity-0 text-sm" ref={tileRef}>PHROLOVA</div>
  </main>;
};
