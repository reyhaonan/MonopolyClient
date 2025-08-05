import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import type { GameState } from "@/types/GameState";

interface GameHubState {
  hubConnection: signalR.HubConnection | null;
  playerId: string | null;
  gameState: GameState | null;
  // Add more state properties as needed
}

const useGameHub = (gameId?: string) => {
  const [gameHubState, setGameHubState] = useState<GameHubState>({
    hubConnection: null,
    playerId: null,
    gameState: null,
  });

  useEffect(() => {
    if (!gameId) return;
    const connectToHub = async () => {
      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/gameHubs`)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      hubConnection.on("PlayerIdAssignmentResponse", (playerId: string) => {
        setGameHubState((prevState) => ({ ...prevState, playerId }));
      });

      hubConnection.on("JoinGameResponse", (gameId: string, players: any[]) => {
        // Handle join game response
        console.log("JoinGameResponse", gameId, players);
      });

      hubConnection.on("StartGameResponse", (gameId: string, newPlayerOrder: any[]) => {
        // Handle start game response
        console.log("StartGameResponse", gameId, newPlayerOrder);
      });

      hubConnection.on("SpectateGameResponse", (gameState: GameState) => {
        setGameHubState((prevState) => ({ ...prevState, gameState }));
      });

      hubConnection.on(
        "DiceRolledResponse",
        (gameId: string, playerId: string, rollResult: any) => {
          // Handle dice rolled response
          console.log("DiceRolledResponse", gameId, playerId, rollResult);
        }
      );

      hubConnection.on("EndTurnResponse", (gameId: string, nextPlayerIndex: number) => {
        // Handle end turn response
        console.log("EndTurnResponse", gameId, nextPlayerIndex);
      });

      hubConnection.on(
        "DeclareBankcruptcyResponse",
        (gameId: string, removedPlayerId: string, nextPlayerIndex: number) => {
          console.log("DeclareBankcruptcyResponse", gameId, removedPlayerId, nextPlayerIndex);
        }
      );

      hubConnection.on(
        "PropertyBoughtResponse",
        (gameId: string, buyerId: string, propertyId: string, transactions: any[]) => {
          console.log("PropertyBoughtResponse", gameId, buyerId, propertyId, transactions);
        }
      );

      hubConnection.on("InitiateTradeResponse", (gameId: string, trade: any) => {
        console.log("InitiateTradeResponse", gameId, trade);
      });

      hubConnection.on(
        "AcceptTradeResponse",
        (gameId: string, tradeId: string, transactions: any[]) => {
          console.log("AcceptTradeResponse", gameId, tradeId, transactions);
        }
      );

      hubConnection.on("RejectTradeResponse", (gameId: string, tradeId: string) => {
        console.log("RejectTradeResponse", gameId, tradeId);
      });

      try {
        await hubConnection.start();
        console.log("SignalR Connected.");
        setGameHubState((prevState) => ({ ...prevState, hubConnection }));

        // Invoke SpectateGame after connection
        hubConnection
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
      if (gameHubState.hubConnection) {
        gameHubState.hubConnection.stop();
      }
    };
  }, [gameId]);

  // Define functions to invoke server methods
  const joinGame = async (gameId: string, playerName: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("JoinGame", gameId, playerName);
      } catch (error) {
        console.error("Error while calling JoinGame: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const startGame = async (gameId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("StartGame", gameId);
      } catch (error) {
        console.error("Error while calling StartGame: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const rollDice = async (gameId: string, playerId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("RollDice", gameId, playerId);
      } catch (error) {
        console.error("Error while calling RollDice: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const endTurn = async (gameId: string, playerId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("EndTurn", gameId, playerId);
      } catch (error) {
        console.error("Error while calling EndTurn: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const declareBankcruptcy = async (gameId: string, playerId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("DeclareBankcruptcy", gameId, playerId);
      } catch (error) {
        console.error("Error while calling DeclareBankcruptcy: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const useGetOutOfJailCard = async (gameId: string, playerId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("UseGetOutOfJailCard", gameId, playerId);
      } catch (error) {
        console.error("Error while calling UseGetOutOfJailCard: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const payToGetOutOfJail = async (gameId: string, playerId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("PayToGetOutOfJail", gameId, playerId);
      } catch (error) {
        console.error("Error while calling PayToGetOutOfJail: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const buyProperty = async (gameId: string, playerId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("BuyProperty", gameId, playerId);
      } catch (error) {
        console.error("Error while calling BuyProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const sellProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("SellProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling SellProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const upgradeProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("UpgradeProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling UpgradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const downgradeProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("DowngradeProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling DowngradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const mortgageProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("MortgageProperty", gameId, playerId, propertyId);
      } catch (error) {
        console.error("Error while calling MortgageProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const unmortgageProperty = async (gameId: string, playerId: string, propertyId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("UnmortgageProperty", gameId, playerId, propertyId);
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
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke(
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
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("AcceptTrade", gameId, approvalId, tradeId);
      } catch (error) {
        console.error("Error while calling AcceptTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const rejectTrade = async (gameId: string, approvalId: string, tradeId: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("RejectTrade", gameId, approvalId, tradeId);
      } catch (error) {
        console.error("Error while calling RejectTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  return {
    ...gameHubState,
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
