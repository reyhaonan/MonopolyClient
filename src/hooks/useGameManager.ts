import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import type { GameState } from "@/types/GameState";
import type { Player } from "@/types/Player";
import type { BoardSpace } from "@/types/BoardSpace";
import type { TransactionInfo } from "@/types/TransactionInfo";
import type { Trade } from "@/types/Trade";
import { GamePhase } from "@/enums/GamePhase";
import type { RollResult } from "@/types/RollResult";
import { produce, type WritableDraft } from "immer";

const useGameManager = (gameId?: string, playerId?: string) => {
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<{ spaces: BoardSpace[] }>({ spaces: [] });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [diceRoll1, setDiceRoll1] = useState<number>(0);
  const [diceRoll2, setDiceRoll2] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>(GamePhase.WaitingForPlayers);
  const [transactionsHistory, setTransactionsHistory] = useState<{
    history: TransactionInfo[];
  }>({
    history: [],
  });
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const currentPlayer = activePlayers[currentPlayerIndex];

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

      tempHubConnection.on("JoinGameResponse", (_, players: Player[]) => {
        // Handle join game response
        setActivePlayers(players);
      });

      tempHubConnection.on("StartGameResponse", (_, newPlayerOrder: Player[]) => {
        // Handle start game response
        setActivePlayers(newPlayerOrder);
        setCurrentPlayerIndex(0);
        setCurrentPhase(GamePhase.PlayerTurnStart);
      });

      tempHubConnection.on("SpectateGameResponse", (gameState: GameState) => {
        setActivePlayers(gameState.activePlayers);
        setBoard(gameState.board);
        setCurrentPlayerIndex(gameState.currentPlayerIndex);
        setDiceRoll1(0);
        setDiceRoll2(0);

        setCurrentPhase(gameState.currentPhase);
        setTransactionsHistory(gameState.transactionsHistory);
        setActiveTrades(gameState.activeTrades);
      });

      tempHubConnection.on("DiceRolledResponse", (_, playerId: string, rollResult: RollResult) => {
        setDiceRoll1(rollResult.dice.roll1);
        setDiceRoll2(rollResult.dice.roll2);
        setCurrentPhase(GamePhase.PostLandingActions);

        // TODO: Animate
        setActivePlayers((state) => {
          return produce(state, (draft) => {
            const playerIndex = draft.findIndex((player) => player.id === playerId);
            if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);

            draft[playerIndex].currentPosition = rollResult.playerState.newPlayerPosition;
            draft[playerIndex].jailTurnsRemaining =
              rollResult.playerState.newPlayerJailTurnsRemaining;
            draft[playerIndex].isInJail = rollResult.playerState.isInJail;

            rollResult.transaction.forEach((transaction) => processTransaction(draft, transaction));
          });
        });
      });

      tempHubConnection.on("EndTurnResponse", (_, nextPlayerIndex: number) => {
        setCurrentPhase(GamePhase.PlayerTurnStart);
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
      currentPlayer,
      diceRoll1,
      diceRoll2,
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

export default useGameManager;

const processTransaction = (players: Player[], transaction: TransactionInfo) => {
  // Transaction to bank
  if (transaction.isTransactionWithBank) {
    // Player pay to bank
    if (transaction.receiverId === null) {
      const playerToDeductIndex = players.findIndex((p) => p.id === transaction.senderId);
      if (playerToDeductIndex == -1) throw new Error("player to deduct not found");

      players[playerToDeductIndex].money -= transaction.amount;
    }
    // Bank pay to player
    else {
      const playerToAddMoneyIndex = players.findIndex((p) => p.id === transaction.receiverId);
      if (playerToAddMoneyIndex == -1) throw new Error("player to add money not found");
      players[playerToAddMoneyIndex].money += transaction.amount;
    }
  }
  // Transaction between player(rent)
  else {
    const playerToAddMoneyIndex = players.findIndex((p) => p.id === transaction.receiverId);

    if (playerToAddMoneyIndex == -1) throw new Error("player to add money not found");
    players[playerToAddMoneyIndex].money += transaction.amount;

    const playerToDeductIndex = players.findIndex((p) => p.id === transaction.senderId);

    if (playerToDeductIndex == -1) throw new Error("player to deduct money from not found");

    players[playerToDeductIndex].money -= transaction.amount;
  }
};
