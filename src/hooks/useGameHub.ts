import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import type { GameState } from "@/types/GameState";

interface GameHubState {
  hubConnection: signalR.HubConnection | null;
  playerId: string | null;
  gameState: GameState | null;
  // Add more state properties as needed
}

const useGameHub = (gameGuid: string) => {
  const [gameHubState, setGameHubState] = useState<GameHubState>({
    hubConnection: null,
    playerId: null,
    gameState: null,
  });

  useEffect(() => {
    const connectToHub = async () => {
      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/gameHub`)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      hubConnection.on("PlayerIdAssignmentResponse", (playerId: string) => {
        setGameHubState((prevState) => ({ ...prevState, playerId }));
      });

      hubConnection.on("JoinGameResponse", (gameGuid: string, players: any[]) => {
        // Handle join game response
        console.log("JoinGameResponse", gameGuid, players);
      });

      hubConnection.on("StartGameResponse", (gameGuid: string, newPlayerOrder: any[]) => {
        // Handle start game response
        console.log("StartGameResponse", gameGuid, newPlayerOrder);
      });

      hubConnection.on("SpectateGameResponse", (gameState: GameState) => {
        setGameHubState((prevState) => ({ ...prevState, gameState }));
      });

      hubConnection.on(
        "DiceRolledResponse",
        (gameGuid: string, playerGuid: string, rollResult: any) => {
          // Handle dice rolled response
          console.log("DiceRolledResponse", gameGuid, playerGuid, rollResult);
        }
      );

      hubConnection.on("EndTurnResponse", (gameGuid: string, nextPlayerIndex: number) => {
        // Handle end turn response
        console.log("EndTurnResponse", gameGuid, nextPlayerIndex);
      });

      hubConnection.on(
        "DeclareBankcruptcyResponse",
        (gameGuid: string, removedPlayerGuid: string, nextPlayerIndex: number) => {
          console.log("DeclareBankcruptcyResponse", gameGuid, removedPlayerGuid, nextPlayerIndex);
        }
      );

      hubConnection.on(
        "PropertyBoughtResponse",
        (gameId: string, buyerId: string, propertyGuid: string, transactions: any[]) => {
          console.log("PropertyBoughtResponse", gameId, buyerId, propertyGuid, transactions);
        }
      );

      hubConnection.on("InitiateTradeResponse", (gameId: string, trade: any) => {
        console.log("InitiateTradeResponse", gameId, trade);
      });

      hubConnection.on(
        "AcceptTradeResponse",
        (gameId: string, tradeGuid: string, transactions: any[]) => {
          console.log("AcceptTradeResponse", gameId, tradeGuid, transactions);
        }
      );

      hubConnection.on("RejectTradeResponse", (gameId: string, tradeGuid: string) => {
        console.log("RejectTradeResponse", gameId, tradeGuid);
      });

      try {
        await hubConnection.start();
        console.log("SignalR Connected.");
        setGameHubState((prevState) => ({ ...prevState, hubConnection }));

        // Invoke SpectateGame after connection
        hubConnection
          .invoke("SpectateGame", gameGuid)
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
  }, [gameGuid]);

  // Define functions to invoke server methods
  const joinGame = async (gameGuid: string, playerName: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("JoinGame", gameGuid, playerName);
      } catch (error) {
        console.error("Error while calling JoinGame: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const startGame = async (gameGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("StartGame", gameGuid);
      } catch (error) {
        console.error("Error while calling StartGame: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const rollDice = async (gameGuid: string, playerGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("RollDice", gameGuid, playerGuid);
      } catch (error) {
        console.error("Error while calling RollDice: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const endTurn = async (gameGuid: string, playerGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("EndTurn", gameGuid, playerGuid);
      } catch (error) {
        console.error("Error while calling EndTurn: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const declareBankcruptcy = async (gameGuid: string, playerGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("DeclareBankcruptcy", gameGuid, playerGuid);
      } catch (error) {
        console.error("Error while calling DeclareBankcruptcy: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const useGetOutOfJailCard = async (gameGuid: string, playerGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("UseGetOutOfJailCard", gameGuid, playerGuid);
      } catch (error) {
        console.error("Error while calling UseGetOutOfJailCard: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const payToGetOutOfJail = async (gameGuid: string, playerGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("PayToGetOutOfJail", gameGuid, playerGuid);
      } catch (error) {
        console.error("Error while calling PayToGetOutOfJail: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const buyProperty = async (gameGuid: string, playerGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("BuyProperty", gameGuid, playerGuid);
      } catch (error) {
        console.error("Error while calling BuyProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const sellProperty = async (gameGuid: string, playerGuid: string, propertyGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("SellProperty", gameGuid, playerGuid, propertyGuid);
      } catch (error) {
        console.error("Error while calling SellProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const upgradeProperty = async (gameGuid: string, playerGuid: string, propertyGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke(
          "UpgradeProperty",
          gameGuid,
          playerGuid,
          propertyGuid
        );
      } catch (error) {
        console.error("Error while calling UpgradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const downgradeProperty = async (gameGuid: string, playerGuid: string, propertyGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke(
          "DowngradeProperty",
          gameGuid,
          playerGuid,
          propertyGuid
        );
      } catch (error) {
        console.error("Error while calling DowngradeProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const mortgageProperty = async (gameGuid: string, playerGuid: string, propertyGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke(
          "MortgageProperty",
          gameGuid,
          playerGuid,
          propertyGuid
        );
      } catch (error) {
        console.error("Error while calling MortgageProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const unmortgageProperty = async (gameGuid: string, playerGuid: string, propertyGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke(
          "UnmortgageProperty",
          gameGuid,
          playerGuid,
          propertyGuid
        );
      } catch (error) {
        console.error("Error while calling UnmortgageProperty: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const initiateTrade = async (
    gameGuid: string,
    initiatorGuid: string,
    recipientGuid: string,
    propertyOffer: string[],
    propertyCounterOffer: string[],
    moneyFromInitiator: number,
    moneyFromRecipient: number
  ) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke(
          "InitiateTrade",
          gameGuid,
          initiatorGuid,
          recipientGuid,
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

  const acceptTrade = async (gameGuid: string, approvalId: string, tradeGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("AcceptTrade", gameGuid, approvalId, tradeGuid);
      } catch (error) {
        console.error("Error while calling AcceptTrade: ", error);
      }
    } else {
      console.warn("Hub connection not established.");
    }
  };

  const rejectTrade = async (gameGuid: string, approvalId: string, tradeGuid: string) => {
    if (gameHubState.hubConnection) {
      try {
        await gameHubState.hubConnection.invoke("RejectTrade", gameGuid, approvalId, tradeGuid);
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
