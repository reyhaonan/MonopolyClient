import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import type { GameState } from "@/types/GameState";
import type { Player } from "@/types/Player";
import type { BoardSpace, PropertySpace } from "@/types/BoardSpace";
import type { TransactionInfo } from "@/types/TransactionInfo";
import type { Trade } from "@/types/Trade";
import { GamePhase } from "@/enums/GamePhase";
import type { RollResult } from "@/types/RollResult";
import { produce } from "immer";
import { CustomHttpClient } from "@/utils/axiosInstance";
import { gameConfigInitial, type GameConfig } from "@/types/GameConfig";
import { ChanceOutcome } from "@/types/ChanceOutcome";
import { TreasureOutcome } from "@/types/TreasureOutcome";
import { RentStage } from "@/enums/RentStage";

const MOVEMENT_SPEED = 50;
const MAXIMUM_SPACE = 40;
const POPOVER_TIME_MS = 5000;

const useGameManager = (gameId?: string, playerId?: string) => {
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<{ spaces: BoardSpace[] }>({ spaces: [] });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [diceRoll1, setDiceRoll1] = useState<number>(0);
  const [diceRoll2, setDiceRoll2] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>(GamePhase.WaitingForPlayers);
  const [transactionsHistory, setTransactionsHistory] = useState<TransactionInfo[]>([]);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig>(gameConfigInitial);
  const [chancePopovers, setChancePopovers] = useState<Map<number, string>>(new Map());
  const [treasurePopovers, setTreasurePopovers] = useState<Map<number, string>>(new Map());

  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerSpace = currentPlayer ? board.spaces[currentPlayer.currentPosition] : null;

  function queueTreasurePopoverRemoval(key: number, delay: number) {
    setTimeout(() => {
      setTreasurePopovers((state) =>
        produce(state, (draft) => {
          draft.delete(key);
        })
      );
    }, delay);
  }

  function queueChancePopoverRemoval(key: number, delay: number) {
    setTimeout(() => {
      setChancePopovers((state) =>
        produce(state, (draft) => {
          draft.delete(key);
        })
      );
    }, delay);
  }

  useEffect(() => {
    if (!gameId || !playerId) return;
    const connectToHub = async () => {
      const tempHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/gameHubs`, {
          httpClient: new CustomHttpClient(),
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      tempHubConnection.on("JoinGameResponse", (_, players: Player[]) => {
        setPlayers(players);
      });

      tempHubConnection.on("StartGameResponse", (_, newPlayerOrder: Player[]) => {
        setPlayers(newPlayerOrder);
        setCurrentPlayerIndex(0);
        setCurrentPhase(GamePhase.PlayerTurnStart);
      });

      tempHubConnection.on(
        "PayToGetOutOfJailResponse",
        (_, playerId: string, transactions: TransactionInfo[]) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              const playerIndex = draft.findIndex((player) => player.id === playerId);
              if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);
              draft[playerIndex].isInJail = false;
              draft[playerIndex].jailTurnsRemaining = 0;

              transactions.forEach((transaction) => processTransaction(draft, transaction));
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));
        }
      );
      tempHubConnection.on("UseGetOutOfJailCardResponse", (_, playerId: string) => {
        setPlayers((state) =>
          produce(state, (draft) => {
            const playerIndex = draft.findIndex((player) => player.id === playerId);
            if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);
            draft[playerIndex].isInJail = false;
            draft[playerIndex].jailTurnsRemaining = 0;
            draft[playerIndex].getOutOfJailFreeCards--;
          })
        );
      });

      tempHubConnection.on("UpdateGameConfigResponse", (_, newGameConfig: GameConfig) => {
        setGameConfig(newGameConfig);
      });

      tempHubConnection.on("SyncGameResponse", (gameState: GameState) => {
    
        setPlayers(gameState.players);
        setBoard(gameState.board);
        setCurrentPlayerIndex(gameState.currentPlayerIndex);
        setDiceRoll1(0);
        setDiceRoll2(0);
        setGameConfig(gameState.gameConfig);

        setCurrentPhase(gameState.currentPhase);
        setTransactionsHistory(gameState.transactionsHistory.history);
        setActiveTrades(gameState.activeTrades);
      });

      tempHubConnection.on("DiceRolledResponse", (_, playerId: string, rollResult: RollResult) => {
        setDiceRoll1(rollResult.dice.roll1);
        setDiceRoll2(rollResult.dice.roll2);

        setPlayers((state) => {
          return produce(state, (draft) => {
            const playerIndex = draft.findIndex((player) => player.id === playerId);
            if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);

            draft[playerIndex].jailTurnsRemaining =
              rollResult.playerState.newPlayerJailTurnsRemaining;
            draft[playerIndex].isInJail = rollResult.playerState.isInJail;
            draft[playerIndex].consecutiveDoubles = rollResult.playerState.consecutiveDoubles;
          });
        });

        setCurrentPhase(GamePhase.MovingToken);
        let curr = 0;
        let destination = rollResult.dice.roll1 + rollResult.dice.roll2;
        if (!rollResult.playerState.isInJail) {
          const intervalId = setInterval(() => {
            curr++;
            setPlayers((state) =>
              produce(state, (draft) => {
                const playerIndex = draft.findIndex((player) => player.id === playerId);
                if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);
                draft[playerIndex].currentPosition =
                  (draft[playerIndex].currentPosition + 1) % MAXIMUM_SPACE;
              })
            );
            if (curr == destination) {
              setPlayers((state) =>
                produce(state, (draft) => {
                  rollResult.transaction.forEach((transaction) =>
                    processTransaction(draft, transaction)
                  );
                  Object.entries(rollResult.treasureCardsDrawn).forEach(([position, card]) => {
                    const playerIndex = draft.findIndex((player) => player.id === playerId);
                    if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);

                    setTreasurePopovers((state) =>
                      produce(state, (draft) => {
                        draft.set(Number(position), card.flavorText);
                      })
                    );

                    queueTreasurePopoverRemoval(Number(position), POPOVER_TIME_MS);

                    switch (card.treasureOutcome) {
                      case TreasureOutcome.AdvanceToGo:
                        draft[playerIndex].currentPosition = 0;
                        break;
                      case TreasureOutcome.GetOutOfJailFreeCard:
                        draft[playerIndex].getOutOfJailFreeCards++;
                        break;
                    }
                  });
                  Object.entries(rollResult.chanceCardsDrawn).forEach(([position, card]) => {
                    const playerIndex = draft.findIndex((player) => player.id === playerId);
                    if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);

                    setChancePopovers((state) =>
                      produce(state, (draft) => {
                        draft.set(Number(position), card.flavorText);
                      })
                    );

                    queueChancePopoverRemoval(Number(position), POPOVER_TIME_MS);

                    switch (card.chanceOutcome) {
                      case ChanceOutcome.AdvanceToGo:
                        draft[playerIndex].currentPosition = 0;
                        break;

                      case ChanceOutcome.GetOutOfJailFreeCard:
                        draft[playerIndex].getOutOfJailFreeCards++;
                        break;
                      case ChanceOutcome.AdvanceToNearestRailroad:
                      case ChanceOutcome.AdvanceToNearestUtility:
                      case ChanceOutcome.AdvanceToProperty:
                      case ChanceOutcome.GoBackXSpace:
                        draft[playerIndex].currentPosition =
                          rollResult.playerState.newPlayerPosition;
                    }
                  });
                })
              );
              setCurrentPhase(rollResult.newGamePhase);
              clearInterval(intervalId);
            }
          }, MOVEMENT_SPEED);
        } else {
          setPlayers((state) =>
            produce(state, (draft) => {
              const playerIndex = draft.findIndex((player) => player.id === playerId);
              if (playerIndex === -1) throw new Error(`No player found for id: ${playerId}`);
              // JAIL
              draft[playerIndex].currentPosition = rollResult.playerState.newPlayerPosition;
              rollResult.transaction.forEach((transaction) =>
                processTransaction(draft, transaction)
              );
            })
          );

          setCurrentPhase(rollResult.newGamePhase);
        }

        setTransactionsHistory((state) => rollResult.transaction.concat(state));
      });

      tempHubConnection.on("EndTurnResponse", (_, nextPlayerIndex: number) => {
        setCurrentPhase(GamePhase.PlayerTurnStart);
        setCurrentPlayerIndex(nextPlayerIndex);
      });

      tempHubConnection.on(
        "DeclareBankcruptcyResponse",
        (_, bankcruptPlayerId: string, nextPlayerIndex: number) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              const index = draft.findIndex((p) => p.id === bankcruptPlayerId);
              if (index != -1) {
                draft[index].isBankrupt = true
                draft[index].propertiesOwned.forEach(propertyId => {
                setBoard(state => produce(state, boardDraft => {
                    const propertyIndex = boardDraft.spaces.findIndex(p => p.id === propertyId && p.$type !== "special");
                    if(propertyIndex){
                      const property = boardDraft.spaces[propertyIndex] as PropertySpace
                      property.ownerId = null
                      property.isMortgaged = false
                      if(property.$type == "country")property.currentRentStage = RentStage.Unimproved
                    }
                  }))
                })
                setActiveTrades(state => state.filter(t => t.initiatorId != bankcruptPlayerId && t.recipientId != bankcruptPlayerId))

                draft[index].propertiesOwned = []
              }
            })
          );
          setCurrentPlayerIndex(nextPlayerIndex);
        }
      );
      tempHubConnection.on("GameOverResponse", (_) => {
        setCurrentPhase(GamePhase.GameOver);
        hubConnection?.stop();
      });

      tempHubConnection.on(
        "PropertyBoughtResponse",
        (_, buyerId: string, propertyId: string, transactions: TransactionInfo[]) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              const activePlayerIndex = draft.findIndex((p) => p.id === buyerId);
              if (activePlayerIndex == -1) throw new Error("Buyer is not found");
              transactions.forEach((transactions) => processTransaction(draft, transactions));
              draft[activePlayerIndex].propertiesOwned.push(propertyId);
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));

          setBoard((state) =>
            produce(state, (draft) => {
              const propertyBought = draft.spaces.find((space) => space.id === propertyId);
              if (!propertyBought) throw new Error("no property found");
              switch (propertyBought.$type) {
                case "country":
                case "railroad":
                case "utility":
                  propertyBought.ownerId = buyerId;
                  break;
                default:
                  throw new Error("Not a purchasable space");
              }
            })
          );
        }
      );

      tempHubConnection.on(
        "PropertySoldResponse",
        (_, buyerId: string, propertyId: string, transactions: TransactionInfo[]) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              const activePlayerIndex = draft.findIndex((p) => p.id === buyerId);
              if (activePlayerIndex == -1) throw new Error("Buyer is not found");
              transactions.forEach((transactions) => processTransaction(draft, transactions));

              const toDeleteIndex = draft[activePlayerIndex].propertiesOwned.findIndex(
                (p) => p == propertyId
              );
              if (toDeleteIndex !== -1)
                draft[activePlayerIndex].propertiesOwned.splice(toDeleteIndex, 1);
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));

          setBoard((state) =>
            produce(state, (draft) => {
              const propertyBoughtIndex = draft.spaces.findIndex(
                (space) => space.id === propertyId
              );
              if (propertyBoughtIndex == -1) throw new Error("no property found");
              switch (draft.spaces[propertyBoughtIndex].$type) {
                case "country":
                case "railroad":
                case "utility":
                  draft.spaces[propertyBoughtIndex].ownerId = null;
                  draft.spaces[propertyBoughtIndex].isMortgaged = false;
                  break;
                default:
                  throw new Error("Not a sellable space");
              }
            })
          );
        }
      );

      tempHubConnection.on(
        "PropertyMortgagedResponse",
        (_, propertyId: string, transactions: TransactionInfo[]) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              transactions.forEach((transactions) => processTransaction(draft, transactions));
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));

          setBoard((state) =>
            produce(state, (draft) => {
              const propertyBoughtIndex = draft.spaces.findIndex(
                (space) => space.id === propertyId
              );
              if (propertyBoughtIndex == -1) throw new Error("not a mortgage-able space");
              switch (draft.spaces[propertyBoughtIndex].$type) {
                case "country":
                case "railroad":
                case "utility":
                  draft.spaces[propertyBoughtIndex].isMortgaged = true;
                  break;
                default:
                  throw new Error("Not a sellable space");
              }
            })
          );
        }
      );

      tempHubConnection.on(
        "PropertyUnmortgagedResponse",
        (_, propertyId: string, transactions: TransactionInfo[]) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              transactions.forEach((transactions) => processTransaction(draft, transactions));
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));

          setBoard((state) =>
            produce(state, (draft) => {
              const propertyBoughtIndex = draft.spaces.findIndex(
                (space) => space.id === propertyId
              );
              if (propertyBoughtIndex == -1) throw new Error("not a mortgage-able space");
              switch (draft.spaces[propertyBoughtIndex].$type) {
                case "country":
                case "railroad":
                case "utility":
                  draft.spaces[propertyBoughtIndex].isMortgaged = false;
                  break;
                default:
                  throw new Error("Not a sellable space");
              }
            })
          );
        }
      );

      tempHubConnection.on(
        "PropertyUpgradeResponse",
        (_, propertyId: string, transactions: TransactionInfo[]) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              transactions.forEach((transactions) => processTransaction(draft, transactions));
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));

          setBoard((state) =>
            produce(state, (draft) => {
              const propertyBoughtIndex = draft.spaces.findIndex(
                (space) => space.id === propertyId
              );
              if (propertyBoughtIndex == -1) throw new Error("not a mortgage-able space");
              if (draft.spaces[propertyBoughtIndex].$type !== "country")
                throw new Error("Not a country");

              draft.spaces[propertyBoughtIndex].currentRentStage++;
            })
          );
        }
      );

      tempHubConnection.on(
        "PropertyDowngradeResponse",
        (_, propertyId: string, transactions: TransactionInfo[]) => {
          setPlayers((state) =>
            produce(state, (draft) => {
              transactions.forEach((transactions) => processTransaction(draft, transactions));
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));

          setBoard((state) =>
            produce(state, (draft) => {
              const propertyBoughtIndex = draft.spaces.findIndex(
                (space) => space.id === propertyId
              );
              if (propertyBoughtIndex == -1) throw new Error("not a mortgage-able space");
              if (draft.spaces[propertyBoughtIndex].$type !== "country")
                throw new Error("Not a country");

              draft.spaces[propertyBoughtIndex].currentRentStage--;
            })
          );
        }
      );

      tempHubConnection.on("InitiateTradeResponse", (_, trade: Trade) => {
        setActiveTrades((state) => state.concat(trade));
      });
      tempHubConnection.on("NegotiateTradeResponse", (_, trade: Trade) => {
        setActiveTrades((state) =>
          produce(state, (draft) => {
            const index = draft.findIndex((tr) => tr.id === trade.id);
            if (index == -1) throw new Error("Trade to replace is not found");
            draft[index] = trade;
          })
        );
      });

      tempHubConnection.on(
        "AcceptTradeResponse",
        (_, trade: Trade, transactions: TransactionInfo[]) => {
          setActiveTrades((state) =>
            produce(state, (draft) => {
              const index = draft.findIndex((tr) => tr.id === trade.id);
              if (index == -1) throw new Error("Trade to remove is not found");
              draft.splice(index, 1);
            })
          );

          setPlayers((state) =>
            produce(state, (draft) => {
              const initiatorIndex = draft.findIndex((p) => p.id === trade.initiatorId);
              if (initiatorIndex == -1) throw new Error("Initiator not found");

              const recipientIndex = draft.findIndex((p) => p.id === trade.recipientId);
              if (recipientIndex == -1) throw new Error("Recipient not found");
              // Update the initiator
              {
                draft[initiatorIndex].propertiesOwned = draft[
                  initiatorIndex
                ].propertiesOwned.filter((pr) => !trade.propertyOffer.includes(pr));
                draft[initiatorIndex].propertiesOwned.push(...trade.propertyCounterOffer);
              }

              // Update the recipient
              {
                draft[recipientIndex].propertiesOwned = draft[
                  recipientIndex
                ].propertiesOwned.filter((pr) => !trade.propertyCounterOffer.includes(pr));
                draft[recipientIndex].propertiesOwned.push(...trade.propertyOffer);
              }

              // Update get out of jail card
              if (trade.getOutOfJailCardFromInitiator > 0) {
                draft[initiatorIndex].getOutOfJailFreeCards +=
                  trade.getOutOfJailCardFromInitiator * -1;
                draft[recipientIndex].getOutOfJailFreeCards += trade.getOutOfJailCardFromInitiator;
              }
              if (trade.getOutOfJailCardFromRecipient > 0) {
                draft[recipientIndex].getOutOfJailFreeCards +=
                  trade.getOutOfJailCardFromRecipient * -1;
                draft[initiatorIndex].getOutOfJailFreeCards += trade.getOutOfJailCardFromRecipient;
              }

              transactions.forEach((transactions) => processTransaction(draft, transactions));
            })
          );

          setTransactionsHistory((state) => transactions.concat(state));

          setBoard((state) =>
            produce(state, (draft) => {
              trade.propertyOffer.forEach((offer) => {
                const index = draft.spaces.findIndex((p) => p.id === offer);
                if (index == -1) throw new Error("Property not found");
                if (draft.spaces[index].$type === "special")
                  throw new Error("HUH HOW DID YOU BOUGHT A SPECIAL SPACE???");
                draft.spaces[index].ownerId = trade.recipientId;
              });
              trade.propertyCounterOffer.forEach((offer) => {
                const index = draft.spaces.findIndex((p) => p.id === offer);
                if (index == -1) throw new Error("Property not found");

                if (draft.spaces[index].$type === "special")
                  throw new Error("HUH HOW DID YOU BOUGHT A SPECIAL SPACE???");
                draft.spaces[index].ownerId = trade.initiatorId;
              });
            })
          );
        }
      );

      tempHubConnection.on("RejectTradeResponse", (_, tradeId: string) => {
        setActiveTrades((state) =>
          produce(state, (draft) => {
            const index = draft.findIndex((tr) => tr.id === tradeId);
            if (index == -1) throw new Error("Trade to remove is not found");
            draft.splice(index, 1);
          })
        );
      });

      tempHubConnection.on("CancelTradeResponse", (_, tradeId: string) => {
        setActiveTrades((state) =>
          produce(state, (draft) => {
            const index = draft.findIndex((tr) => tr.id === tradeId);
            if (index == -1) throw new Error("Trade to remove is not found");
            draft.splice(index, 1);
          })
        );
      });

      try {
        await tempHubConnection.start();

        setHubConnection(tempHubConnection);

        // Invoke SpectateGame after connection
        tempHubConnection
          .invoke("SpectateGame", gameId)
          .catch((err) => console.error("Error while calling SpectateGame: ", err));
        tempHubConnection
          .invoke("SyncGame", gameId)
          .catch((err) => console.error("Error while calling SyncGame: ", err));
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
  const syncGame = async () => {
    if (!hubConnection) return;
    await hubConnection
      .invoke("SyncGame", gameId)
      .catch((err) => console.error("Error while calling SyncGame: ", err));
  };
  const joinGame = async (playerName: string, hexColor: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("JoinGame", gameId, playerName, hexColor).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const startGame = async () => {
    if (!hubConnection) return;
    await hubConnection.invoke("StartGame", gameId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const updateGameConfig = async (newGameConfig: GameConfig) => {
    if (!hubConnection) return;
    await hubConnection.invoke("UpdateGameConfig", gameId, newGameConfig).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const rollDice = async () => {
    if (!hubConnection) return;
    await hubConnection.invoke("RollDice", gameId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const endTurn = async () => {
    if (!hubConnection) return;
    await hubConnection.invoke("EndTurn", gameId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const declareBankcruptcy = async () => {
    if (!hubConnection) return;
    await hubConnection.invoke("DeclareBankcruptcy", gameId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const useGetOutOfJailCard = async () => {
    if (!hubConnection) return;
    await hubConnection.invoke("UseGetOutOfJailCard", gameId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const payToGetOutOfJail = async () => {
    if (!hubConnection) return;
    await hubConnection.invoke("PayToGetOutOfJail", gameId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const buyProperty = async () => {
    if (!hubConnection) return;
    await hubConnection.invoke("BuyProperty", gameId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const sellProperty = async (propertyId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("SellProperty", gameId, propertyId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const upgradeProperty = async (propertyId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("UpgradeProperty", gameId, propertyId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const downgradeProperty = async (propertyId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("DowngradeProperty", gameId, propertyId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const mortgageProperty = async (propertyId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("MortgageProperty", gameId, propertyId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const unmortgageProperty = async (propertyId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("UnmortgageProperty", gameId, propertyId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const initiateTrade = async (
    recipientId: string,
    propertyOffer: string[],
    propertyCounterOffer: string[],
    moneyFromInitiator: number,
    moneyFromRecipient: number,
    getOutOfJailCardFromInitiator: number,
    getOutOfJailCardFromRecipient: number
  ) => {
    if (!hubConnection) return;
    await hubConnection
      .invoke(
        "InitiateTrade",
        gameId,
        recipientId,
        propertyOffer,
        propertyCounterOffer,
        moneyFromInitiator,
        moneyFromRecipient,
        getOutOfJailCardFromInitiator,
        getOutOfJailCardFromRecipient
      )
      .catch((err) => {
        console.error(err);
        syncGame();
      });
  };
  const negotiateTrade = async (
    tradeId: string,
    propertyOffer: string[],
    propertyCounterOffer: string[],
    moneyFromInitiator: number,
    moneyFromRecipient: number,
    getOutOfJailCardFromInitiator: number,
    getOutOfJailCardFromRecipient: number
  ) => {
    if (!hubConnection) return;
    await hubConnection
      .invoke(
        "NegotiateTrade",
        gameId,
        tradeId,
        propertyOffer,
        propertyCounterOffer,
        moneyFromInitiator,
        moneyFromRecipient,
        getOutOfJailCardFromInitiator,
        getOutOfJailCardFromRecipient
      )
      .catch((err) => {
        console.error(err);
        syncGame();
      });
  };

  const acceptTrade = async (tradeId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("AcceptTrade", gameId, tradeId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  const rejectTrade = async (tradeId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("RejectTrade", gameId, tradeId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };
  const cancelTrade = async (tradeId: string) => {
    if (!hubConnection) return;
    await hubConnection.invoke("CancelTrade", gameId, tradeId).catch((err) => {
      console.error(err);
      syncGame();
    });
  };

  return {
    gameState: {
      players,
      board,
      currentPlayerIndex,
      currentPlayer,
      currentPlayerSpace,
      diceRoll1,
      diceRoll2,
      currentPhase,
      transactionsHistory,
      activeTrades,
      gameConfig,
      chancePopovers,
      treasurePopovers,
    },
    hubConnection,
    joinGame,
    startGame,
    updateGameConfig,
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
    negotiateTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,
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
