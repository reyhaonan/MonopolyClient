import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import type { GameState } from "@/types/GameState";
import type { Player } from "@/types/Player";
import type { BoardSpace } from "@/types/BoardSpace";
import type { TransactionInfo } from "@/types/TransactionInfo";
import type { Trade } from "@/types/Trade";

const useGameHub = (gameId?: string, playerId?: string) => {
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<{ spaces: BoardSpace[] }>({ spaces: [] });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [totalDiceRoll, setTotalDiceRoll] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [transactionsHistory, setTransactionsHistory] = useState<{ history: TransactionInfo[] }>({
    history: [],
  });
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!gameId || !playerId) return;
    const connectToHub = async () => {
      const csrfToken = sessionStorage.getItem("XSRF-TOKEN");
      if (!csrfToken) return;
      const tempHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/gameHubs`, {
          withCredentials: true,
          headers: {
            "XSRF-TOKEN": csrfToken,
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      tempHubConnection.on("JoinGameResponse", (_, players: any[]) => {
        // Handle join game response
      });

      tempHubConnection.on("StartGameResponse", (_, newPlayerOrder: any[]) => {
        // Handle start game response
      });

      tempHubConnection.on("SpectateGameResponse", (gameState: GameState) => {
        setActivePlayers(gameState.activePlayers);
        setBoard(gameState.board);
        setCurrentPlayerIndex(gameState.currentPlayerIndex);
        setTotalDiceRoll(gameState.totalDiceRoll);
        setCurrentPhase(gameState.currentPhase);
        setTransactionsHistory(gameState.transactionsHistory);
        setActiveTrades(gameState.activeTrades);
      });

      tempHubConnection.on("DiceRolledResponse", (_, playerId: string, rollResult: any) => {
        setTotalDiceRoll(rollResult);
      });

      tempHubConnection.on("EndTurnResponse", (_, nextPlayerIndex: number) => {
        setCurrentPlayerIndex(nextPlayerIndex);
      });

      tempHubConnection.on(
        "DeclareBankcruptcyResponse",
        (_, removedPlayerId: string, nextPlayerIndex: number) => {}
      );

      tempHubConnection.on(
        "PropertyBoughtResponse",
        (_, buyerId: string, propertyId: string, transactions: any[]) => {}
      );

      tempHubConnection.on("InitiateTradeResponse", (_, trade: any) => {});

      tempHubConnection.on("AcceptTradeResponse", (_, tradeId: string, transactions: any[]) => {});

      tempHubConnection.on("RejectTradeResponse", (_, tradeId: string) => {});

      try {
        await tempHubConnection.start();

        setHubConnection(tempHubConnection);

        // Invoke SpectateGame after connection
        tempHubConnection
          .invoke("SpectateGame", gameId)
          .catch((err) => console.error("Error while calling SpectateGame: ", err));
      } catch (err) {
        setTimeout(connectToHub, 5000);
      }
    };

    connectToHub();

    return () => {
      // Cleanup function to close the connection when the component unmounts
      if (hubConnection) {
        hubConnection.stop();
      }
    };
  }, [gameId, playerId]);

  // Define functions to invoke server methods
  const joinGame = async (playerName: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("JoinGame", gameId, playerName);
      } catch (error) {
        console.error("Error while calling JoinGame: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const startGame = async () => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("StartGame", gameId);
      } catch (error) {
        console.error("Error while calling StartGame: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const rollDice = async () => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("RollDice", gameId);
      } catch (error) {
        console.error("Error while calling RollDice: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const endTurn = async () => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("EndTurn", gameId);
      } catch (error) {
        console.error("Error while calling EndTurn: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const declareBankcruptcy = async () => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("DeclareBankcruptcy", gameId);
      } catch (error) {
        console.error("Error while calling DeclareBankcruptcy: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const useGetOutOfJailCard = async () => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("UseGetOutOfJailCard", gameId);
      } catch (error) {
        console.error("Error while calling UseGetOutOfJailCard: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const payToGetOutOfJail = async () => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("PayToGetOutOfJail", gameId);
      } catch (error) {
        console.error("Error while calling PayToGetOutOfJail: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const buyProperty = async () => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("BuyProperty", gameId);
      } catch (error) {
        console.error("Error while calling BuyProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const sellProperty = async (propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("SellProperty", gameId, propertyId);
      } catch (error) {
        console.error("Error while calling SellProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const upgradeProperty = async (propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("UpgradeProperty", gameId, propertyId);
      } catch (error) {
        console.error("Error while calling UpgradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const downgradeProperty = async (propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("DowngradeProperty", gameId, propertyId);
      } catch (error) {
        console.error("Error while calling DowngradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const mortgageProperty = async (propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("MortgageProperty", gameId, propertyId);
      } catch (error) {
        console.error("Error while calling MortgageProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const unmortgageProperty = async (propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("UnmortgageProperty", gameId, propertyId);
      } catch (error) {
        console.error("Error while calling UnmortgageProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const initiateTrade = async (
    initiatorId: string,
    recipientId: string,
    propertyOffer: string[],
    propertyCounterOffer: string[],
    moneyFromInitiator: number,
    moneyFromRecipient: number
  ) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke(
          "InitiateTrade",
          gameId,
          recipientId,
          propertyOffer,
          propertyCounterOffer,
          moneyFromInitiator,
          moneyFromRecipient
        );
      } catch (error) {
        console.error("Error while calling InitiateTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const acceptTrade = async (tradeId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("AcceptTrade", gameId, tradeId);
      } catch (error) {
        console.error("Error while calling AcceptTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const rejectTrade = async (tradeId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("RejectTrade", gameId, tradeId);
      } catch (error) {
        console.error("Error while calling RejectTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  return {
    gameState: {
      activePlayers,
      board,
      currentPlayerIndex,
      totalDiceRoll,
      currentPhase,
      transactionsHistory,
      activeTrades,
    },
    hubConnection,
    joinGame,
    startGame,
    rollDice,
    endTurn,
    declareBankcruptcy,
    useGetOutOfJailCard,
    payToGetOutOfJail,
    buyProperty,
    sellProperty,
    upgradeProperty,
    downgradeProperty,
    mortgageProperty,
    unmortgageProperty,
    initiateTrade,
    acceptTrade,
    rejectTrade,
  };
};

export default useGameHub;
