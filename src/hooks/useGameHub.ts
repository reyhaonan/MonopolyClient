import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import type { GameState } from "@/types/GameState";
import type { Player } from "@/types/Player";
import type { BoardSpace } from "@/types/BoardSpace";
import type { TransactionInfo } from "@/types/TransactionInfo";
import type { Trade } from "@/types/Trade";

const useGameHub = (gameId?: string) => {
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<{ spaces: BoardSpace[] }>({ spaces: [] });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [totalDiceRoll, setTotalDiceRoll] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [transactionsHistory, setTransactionsHistory] = useState<{ history: TransactionInfo[] }>({
    history: [],
  });
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);

  console.log(playerId);

  useEffect(() => {
    if (!gameId) return;
    const connectToHub = async () => {
      const tempHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/gameHubs`)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      tempHubConnection.on("PlayerIdAssignmentResponse", (playerId: string) => {
        setPlayerId(playerId);
      });

      tempHubConnection.on("JoinGameResponse", (gameId: string, players: any[]) => {
        // Handle join game response
        console.log("JoinGameResponse", gameId, players);
      });

      tempHubConnection.on("StartGameResponse", (gameId: string, newPlayerOrder: any[]) => {
        // Handle start game response
        console.log("StartGameResponse", gameId, newPlayerOrder);
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

      tempHubConnection.on(
        "DiceRolledResponse",
        (gameId: string, playerId: string, rollResult: any) => {
          setTotalDiceRoll(rollResult);
        }
      );

      tempHubConnection.on("EndTurnResponse", (gameId: string, nextPlayerIndex: number) => {
        setCurrentPlayerIndex(nextPlayerIndex);
      });

      tempHubConnection.on(
        "DeclareBankcruptcyResponse",
        (gameId: string, removedPlayerId: string, nextPlayerIndex: number) => {
          console.log("DeclareBankcruptcyResponse", gameId, removedPlayerId, nextPlayerIndex);
        }
      );

      tempHubConnection.on(
        "PropertyBoughtResponse",
        (gameId: string, buyerId: string, propertyId: string, transactions: any[]) => {
          console.log("PropertyBoughtResponse", gameId, buyerId, propertyId, transactions);
        }
      );

      tempHubConnection.on("InitiateTradeResponse", (gameId: string, trade: any) => {
        console.log("InitiateTradeResponse", gameId, trade);
      });

      tempHubConnection.on(
        "AcceptTradeResponse",
        (gameId: string, tradeId: string, transactions: any[]) => {
          console.log("AcceptTradeResponse", gameId, tradeId, transactions);
        }
      );

      tempHubConnection.on("RejectTradeResponse", (gameId: string, tradeId: string) => {
        console.log("RejectTradeResponse", gameId, tradeId);
      });

      try {
        await tempHubConnection.start();
        console.log("SignalR Connected.");
        setHubConnection(tempHubConnection);

        // Invoke SpectateGame after connection
        tempHubConnection
          .invoke("SpectateGame", gameId)
          .catch((err) => console.error("Error while calling SpectateGame: ", err));
      } catch (err) {
        console.log(err);
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
  }, [gameId]);

  // Define functions to invoke server methods
  const joinGame = async (gameId: string, playerName: string) => {
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

  const startGame = async (gameId: string) => {
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

  const rollDice = async (gameId: string, playerId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("RollDice", gameId, playerId);
      } catch (error) {
        console.error("Error while calling RollDice: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const endTurn = async (gameId: string, playerId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("EndTurn", gameId, playerId);
      } catch (error) {
        console.error("Error while calling EndTurn: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const declareBankcruptcy = async (gameId: string, playerId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("DeclareBankcruptcy", gameId, playerId);
      } catch (error) {
        console.error("Error while calling DeclareBankcruptcy: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const useGetOutOfJailCard = async (gameId: string, playerId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("UseGetOutOfJailCard", gameId, playerId);
      } catch (error) {
        console.error("Error while calling UseGetOutOfJailCard: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const payToGetOutOfJail = async (gameId: string, playerId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("PayToGetOutOfJail", gameId, playerId);
      } catch (error) {
        console.error("Error while calling PayToGetOutOfJail: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const buyProperty = async (gameId: string, playerId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("BuyProperty", gameId, playerId);
      } catch (error) {
        console.error("Error while calling BuyProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const sellProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("SellProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling SellProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const upgradeProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("UpgradeProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling UpgradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const downgradeProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("DowngradeProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling DowngradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const mortgageProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("MortgageProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling MortgageProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const unmortgageProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("UnmortgageProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling UnmortgageProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const initiateTrade = async (
    gameId: string,
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
          initiatorId,
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

  const acceptTrade = async (gameId: string, approvalId: string, tradeId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("AcceptTrade", gameId, approvalId, tradeId);
      } catch (error) {
        console.error("Error while calling AcceptTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const rejectTrade = async (gameId: string, approvalId: string, tradeId: string) => {
    if (hubConnection) {
      try {
        await hubConnection.invoke("RejectTrade", gameId, approvalId, tradeId);
      } catch (error) {
        console.error("Error while calling RejectTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  return {
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
