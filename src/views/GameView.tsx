import { useEffect, useRef, useState } from 'react'

import * as signalR from '@microsoft/signalr'
import { produce } from 'immer'
import { GamePhase } from '@/enums/GamePhase'
import { ColorGroup } from '@/enums/ColorGroup'
import type { GameState } from '@/types/GameState'
import type { Player } from '@/types/Player'
import type { RollResult } from '@/types/RollResult'
import { RentStage } from '@/enums/RentStage'
import { useCreateGame } from '@/services/useCreateGame'

type AvailableTask =
    'joinGame' |
    'startGame' |
    'rollDice' |
    'buyProperty' |
    'sellProperty' |
    'upgradeProperty' |
    'downgradeProperty' |
    'mortgageProperty' |
    'unmortgageProperty' |
    'endTurn' |
    'declareBankcruptcy'
enum AvailableResponse {
    // Game control
    JoinGameResponse = 'joinGameResponse',
    StartGameResponse = 'startGameResponse',
    // Game event
    PlayerIdAssignmentResponse = 'playerIdAssignmentResponse',
    DiceRolledResponse = 'diceRolledResponse',
    EndTurnResponse = 'endTurnResponse',
    DeclareBankcruptcyResponse = 'declareBankcruptcyResponse',

    // Property
    PropertyBoughtResponse = 'propertyBoughtResponse',
    PropertySoldResponse = 'propertySoldResponse',
    PropertyUpgradeResponse = 'propertyUpgradeResponse',
    PropertyDowngradeResponse = 'propertyDowngradeResponse',
    PropertyMortgagedResponse = 'propertyMortgagedResponse',
    PropertyUnmortgagedResponse = 'propertyUnmortgagedResponse'
}

export const GameView = () => {
    const [gameId, setGameId] = useState('')
    const [playerId, setPlayerId] = useState('')

    const connection = useRef<signalR.HubConnection | null>(null);

    const [gameState, setGameState] = useState<GameState | null>(null);

    const isYourTurn = gameState?.activePlayers[gameState.currentPlayerIndex]?.id === playerId

    const { mutate: createGame } = useCreateGame()

    useEffect(() => {
        connection.current = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL}/gameHubs`)
            .build();

        // Player join
        connection.current.on(AvailableResponse.JoinGameResponse, (_, players: Player[]) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.activePlayers = players
                    draft.players = players
                })
            })
        });

        connection.current.on(AvailableResponse.PlayerIdAssignmentResponse, (playerId: string, game: GameState) => {
            setPlayerId(playerId)
            setGameState(game)
        });

        connection.current.on(AvailableResponse.StartGameResponse, (_, newPlayerOrder: Player[]) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PlayerTurnStart
                    draft.currentPlayerIndex = 0;
                    draft.activePlayers = newPlayerOrder;
                })
            })
        });

        connection.current.on(AvailableResponse.DiceRolledResponse, (_, playerId: string, rollResult: RollResult) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {

                    console.log(`[RollResult]Dice1: ${rollResult.dice.roll1}, Dice2: ${rollResult.dice.roll2}`)
                    // Play animation then change the current phase
                    draft.currentPhase = GamePhase.LandingOnSpaceAction
                    const activePlayer = draft.activePlayers.find(player => player.id === playerId)
                    if (!activePlayer) throw new Error("no player found?????")
                    activePlayer.currentPosition = rollResult.playerState.newPlayerPosition
                    activePlayer.money = rollResult.playerState.newPlayerMoney
                    activePlayer.jailTurnsRemaining = rollResult.playerState.newPlayerJailTurnsRemaining
                    activePlayer.isInJail = rollResult.playerState.isInJail;
                })
            })
        });
        connection.current.on(AvailableResponse.PropertyBoughtResponse, (_, buyerId: string, propertyGuid: string, playerRemainingMoney: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PostLandingActions
                    const activePlayer = draft.activePlayers.find(p => p.id === buyerId)
                    if (!activePlayer) throw new Error("no player found?????")
                    activePlayer.money = playerRemainingMoney;
                    activePlayer.propertiesOwned.push(propertyGuid)

                    const propertyBought = draft.board.spaces.find(space => space.id === propertyGuid)
                    if (!propertyBought) throw new Error("no property found")
                    switch (propertyBought.$type) {
                        case "country":
                        case "railroad":
                        case "utility":
                            propertyBought.ownerId = buyerId
                            break;
                        default:
                            throw new Error("Not a purchasable space")
                    }
                })
            })
        });
        connection.current.on(AvailableResponse.PropertySoldResponse, (_, buyerId: string, propertyGuid: string, playerRemainingMoney: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PostLandingActions
                    const activePlayer = draft.activePlayers.find(p => p.id === buyerId)
                    if (!activePlayer) throw new Error("no player found?????")
                    activePlayer.money = playerRemainingMoney;
                    const toDelete = activePlayer.propertiesOwned.findIndex(p => p == propertyGuid)

                    if (toDelete !== -1) activePlayer.propertiesOwned.splice(toDelete, 1)

                    const propertyBought = draft.board.spaces.find(space => space.id === propertyGuid)
                    if (!propertyBought) throw new Error("no property found")
                    switch (propertyBought.$type) {
                        case "country":
                        case "railroad":
                        case "utility":
                            propertyBought.ownerId = null
                            break;
                        default:
                            throw new Error("Not a purchasable space")
                    }
                })
            })
        });
        connection.current.on(AvailableResponse.PropertyUpgradeResponse, (_, buyerId: string, propertyGuid: string, playerRemainingMoney: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PostLandingActions
                    const activePlayer = draft.activePlayers.find(p => p.id === buyerId)
                    if (!activePlayer) throw new Error("no player found?????")
                    activePlayer.money = playerRemainingMoney;

                    const propertyBought = draft.board.spaces.find(space => space.id === propertyGuid)
                    if (!propertyBought) throw new Error("no property found")
                    if (propertyBought.$type !== "country") throw new Error("Not an upgradable property")
                    propertyBought.currentRentStage++
                })
            })
        });
        connection.current.on(AvailableResponse.PropertyDowngradeResponse, (_, buyerId: string, propertyGuid: string, playerRemainingMoney: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PostLandingActions
                    const activePlayer = draft.activePlayers.find(p => p.id === buyerId)
                    if (!activePlayer) throw new Error("no player found?????")
                    activePlayer.money = playerRemainingMoney;

                    const propertyBought = draft.board.spaces.find(space => space.id === propertyGuid)
                    if (!propertyBought) throw new Error("no property found")
                    if (propertyBought.$type !== "country") throw new Error("Not an upgradable property")
                    propertyBought.currentRentStage--
                })
            })
        });
        connection.current.on(AvailableResponse.PropertyMortgagedResponse, (_, buyerId: string, propertyGuid: string, playerRemainingMoney: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PostLandingActions
                    const activePlayer = draft.activePlayers.find(p => p.id === buyerId)
                    if (!activePlayer) throw new Error("no player found?????")
                    activePlayer.money = playerRemainingMoney;

                    const space = draft.board.spaces.find(space => space.id === propertyGuid)
                    if (!space) throw new Error("no property found")
                    if (space.$type === "special") throw new Error("Not an mortgageAble property")
                    space.isMortgaged = true
                })
            })
        });
        connection.current.on(AvailableResponse.PropertyUnmortgagedResponse, (_, buyerId: string, propertyGuid: string, playerRemainingMoney: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PostLandingActions
                    const activePlayer = draft.activePlayers.find(p => p.id === buyerId)
                    if (!activePlayer) throw new Error("no player found?????")
                    activePlayer.money = playerRemainingMoney;

                    const space = draft.board.spaces.find(space => space.id === propertyGuid)
                    if (!space) throw new Error("no property found")
                    if (space.$type === "special") throw new Error("Not an mortgageAble property")
                    space.isMortgaged = false
                })
            })
        });

        connection.current.on(AvailableResponse.EndTurnResponse, (_, newPlayerIndex: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    draft.currentPhase = GamePhase.PlayerTurnStart
                    draft.currentPlayerIndex = newPlayerIndex
                })
            })
        });

        connection.current.on(AvailableResponse.DeclareBankcruptcyResponse, (_, removedPlayerGuid: string, newPlayerIndex: number) => {
            setGameState(state => {
                if (!state) throw new Error("No active game")
                return produce(state, draft => {
                    if (draft.currentPlayerIndex != newPlayerIndex) {
                        draft.currentPhase = GamePhase.PlayerTurnStart
                        draft.currentPlayerIndex = newPlayerIndex
                    }
                    draft.board.spaces.forEach(space => {
                        if (space.$type !== "special" && space.ownerId == removedPlayerGuid) {
                            space.ownerId = null
                            space.isMortgaged = false
                            if (space.$type === "country") space.currentRentStage = RentStage.Unimproved
                        }
                    })
                    const index = draft.activePlayers.findIndex(p => p.id === removedPlayerGuid)
                    if (index !== -1) draft.activePlayers.splice(index, 1);
                })
            })
        });

        connection.current.start()
            .then(() => console.log("Connection started"))
            .catch(err => console.error("Error while starting connection: ", err));

    }, [])

    const sendMessage = (task: AvailableTask, ...arg: any[]) => {
        if (!connection.current) {
            alert("No connection")
            return
        }
        connection.current.send(task, ...arg)
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Header with game info */}
            <header className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-2 sm:mb-0">
                    <div className="bg-blue-200 border border-blue-600 px-3 py-1 rounded-md">
                        <span className="font-semibold text-blue-900">Game ID:</span>
                        <span className="ml-1 font-mono text-blue-900">{gameId || "None"}</span>
                    </div>
                    <div className="bg-green-200 border border-green-600 px-3 py-1 rounded-md">
                        <span className="font-semibold text-green-900">Player ID:</span>
                        <span className="ml-1 font-mono text-green-900">{playerId ? playerId.substring(0, 8) : "None"}</span>
                    </div>
                    {gameState && (
                        <div className="bg-purple-200 border border-purple-600 px-3 py-1 rounded-md">
                            <span className="font-semibold text-purple-900">Phase:</span>
                            <span className="ml-1 text-purple-900">{GamePhase[gameState.currentPhase]}</span>
                        </div>
                    )}
                </div>

            </header>

            {/* Game controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="text-lg font-semibold mb-3">Game Controls</h2>
                <div className="flex flex-wrap gap-2">
                    {!gameState && (
                        <button
                            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-md transition-colors"
                            onClick={() => createGame(undefined, {
                                onSuccess: res => setGameId(res.data)
                            })}
                        >
                            Create Game
                        </button>
                    )}

                    {!gameState && (
                        <>
                            <input
                                className="border border-gray-300 text-black rounded px-3 py-2 w-full"
                                value={gameId}
                                onChange={(e) => setGameId(e.target.value)}
                                placeholder="Enter Game ID"
                            />
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white font-medium px-4 py-2 rounded-md transition-colors"
                                onClick={() => sendMessage("joinGame", gameId, crypto.randomUUID())}
                            >
                                Join Game
                            </button>
                        </>
                    )}

                    {gameState?.currentPhase === GamePhase.WaitingForPlayers && (
                        <button
                            className="bg-purple-700 hover:bg-purple-800 text-white font-medium px-4 py-2 rounded-md transition-colors"
                            onClick={() => sendMessage("startGame", gameId)}
                        >
                            Start Game
                        </button>
                    )}

                    <button
                        className="bg-red-700 hover:bg-red-800 text-white font-medium px-4 py-2 rounded-md transition-colors"
                        onClick={() => sendMessage("declareBankcruptcy", gameId, playerId)}
                    >
                        Declare Bankcruptcy
                    </button>

                    {isYourTurn && (
                        <>
                            <button
                                className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                                onClick={() => sendMessage("rollDice", gameId, playerId)}
                            >
                                Roll Dice
                            </button>

                            <button
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2 rounded-md transition-colors"
                                onClick={() => sendMessage("buyProperty", gameId, playerId)}
                            >
                                Buy Property
                            </button>

                            <button
                                className="bg-red-700 hover:bg-red-800 text-white font-medium px-4 py-2 rounded-md transition-colors"
                                onClick={() => sendMessage("endTurn", gameId, playerId)}
                            >
                                End Turn
                            </button>

                        </>
                    )}
                </div>
            </div>

            {/* Game information */}
            {gameState && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Player information */}
                    <div className="bg-white rounded-lg shadow-sm p-4 lg:col-span-1">
                        <h2 className="text-lg font-semibold mb-3">Players</h2>
                        <div className="space-y-2">
                            {gameState.activePlayers.map((player, i) => {
                                const isCurrentPlayer = gameState.activePlayers[gameState.currentPlayerIndex]?.id === player.id;
                                return (
                                    <div
                                        key={i}
                                        className={`p-3 rounded-md border ${isCurrentPlayer ? 'bg-yellow-200 border-yellow-600 border-l-4' : 'bg-gray-100 border-gray-300'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono font-semibold text-gray-900">{player.id.substring(0, 8)}{player.id === playerId && "(YOU)"}</span>
                                            {isCurrentPlayer && <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium">CURRENT TURN</span>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                                <span className="text-gray-700 font-medium">Position:</span>
                                                <span className="ml-1 font-bold text-gray-900">{player.currentPosition}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-700 font-medium">Money:</span>
                                                <span className="ml-1 font-bold text-gray-900">${player.money}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-700 font-medium">Properties:</span>
                                                <span className="ml-1 font-bold text-gray-900">
                                                    {player.propertiesOwned.length ? player.propertiesOwned.join(', ') : 'None'}
                                                </span>
                                            </div>
                                            {player.isInJail && (
                                                <div className="col-span-2 bg-red-100 text-red-800 px-2 py-1 rounded font-medium border border-red-300">
                                                    In Jail ({player.jailTurnsRemaining} turns remaining)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Game board */}
                    <div className="bg-white rounded-lg shadow-sm p-4 lg:col-span-2 overflow-auto">
                        <h2 className="text-lg font-semibold mb-3">Game Board</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-2">
                            {gameState.board.spaces.map((space, i) => {
                                // Determine space type for styling
                                let spaceClass = "space-special";
                                let bgColor = "bg-gray-100";
                                let textColor = "text-gray-900";
                                let borderColor = "border-gray-400";

                                if (space.$type === "country") {
                                    spaceClass = `property-group-${space.group}`;

                                    // Map group numbers to colors with better contrast
                                    const colorMap: Record<number, { bg: string, text: string, border: string }> = {
                                        [ColorGroup.Brown]: { bg: "bg-amber-200", text: "text-amber-900", border: "border-amber-600" },
                                        [ColorGroup.LightBlue]: { bg: "bg-sky-200", text: "text-sky-900", border: "border-sky-600" },
                                        [ColorGroup.Pink]: { bg: "bg-pink-200", text: "text-pink-900", border: "border-pink-600" },
                                        [ColorGroup.Orange]: { bg: "bg-orange-200", text: "text-orange-900", border: "border-orange-600" },
                                        [ColorGroup.Red]: { bg: "bg-red-200", text: "text-red-900", border: "border-red-600" },
                                        [ColorGroup.Yellow]: { bg: "bg-yellow-200", text: "text-yellow-900", border: "border-yellow-600" },
                                        [ColorGroup.Green]: { bg: "bg-green-200", text: "text-green-900", border: "border-green-600" },
                                        [ColorGroup.DarkBlue]: { bg: "bg-blue-200", text: "text-blue-900", border: "border-blue-600" }
                                    };

                                    const colors = colorMap[space.group] || { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-400" };
                                    bgColor = colors.bg;
                                    textColor = colors.text;
                                    borderColor = colors.border;
                                } else if (space.$type === "railroad") {
                                    spaceClass = "space-railroad";
                                    bgColor = "bg-gray-200";
                                    borderColor = "border-gray-600";
                                } else if (space.$type === "utility") {
                                    spaceClass = "space-utility";
                                    bgColor = "bg-emerald-200";
                                    textColor = "text-emerald-900";
                                    borderColor = "border-emerald-600";
                                }

                                // Check if any player is on this space
                                const playersOnSpace = gameState.activePlayers.filter(
                                    player => player.currentPosition === space.boardPosition
                                );

                                return (
                                    <div
                                        key={space.id}
                                        className={`${bgColor} border ${borderColor} rounded-md p-2 relative ${playersOnSpace.length > 0 ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs bg-gray-700 text-white font-medium rounded-full px-2 py-0.5">{i}</span>
                                            {space.$type === "country" && space.ownerId && (
                                                <span className="text-xs bg-blue-600 text-white font-medium rounded-full px-2 py-0.5">
                                                    {space.ownerId.substring(0, 4)}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`font-medium mt-1 ${textColor}`}>{space.name}</div>

                                        {(space.$type !== "special") && (
                                            <div className={`text-xs ${textColor} mt-1`}>
                                                <div className="font-medium">Price: ${space.purchasePrice}</div>
                                                {space.ownerId == playerId && <>
                                                    <button onClick={() => sendMessage(space.isMortgaged ? 'unmortgageProperty' : 'mortgageProperty', gameId, playerId, space.id)} className='bg-black text-white p-1 px-2 cursor-pointer mr-2'>
                                                        {space.isMortgaged ? 'Unmortgage' : 'Mortgage'}
                                                    </button>
                                                    <br />
                                                    <button onClick={() => sendMessage('sellProperty', gameId, playerId, space.id)} className='bg-black text-white p-1 px-2 cursor-pointer mr-2'>$$</button>
                                                    <br />
                                                    <button onClick={() => sendMessage('downgradeProperty', gameId, playerId, space.id)} className='bg-black text-white p-1 px-2 cursor-pointer mr-2'>-</button>
                                                    <button onClick={() => sendMessage('upgradeProperty', gameId, playerId, space.id)} className='bg-black text-white p-1 px-2 cursor-pointer'>+</button>

                                                </>}
                                                {space.$type === 'country' && <>
                                                    <div className="font-medium">House Cost: {space.houseCost}</div>
                                                    <div className="font-medium">Rent Stage: {space.currentRentStage}</div>
                                                </>}
                                            </div>
                                        )}

                                        {playersOnSpace.length > 0 && (
                                            <div className="absolute -top-2 -right-2 flex -space-x-1">
                                                {playersOnSpace.map((player, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-max p-2 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold border-2 border-white"
                                                        title={player.id}
                                                    >
                                                        {player.id.substring(0, 8)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

