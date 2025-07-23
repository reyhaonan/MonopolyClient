import { useEffect, useRef, useState } from 'react'
import './App.css'

import * as signalR from '@microsoft/signalr'
import { produce } from 'immer'
import { GamePhase } from './types/GamePhase'

type AvailableTask = 'createGame' | 'joinGame' | 'startGame' | 'rollDice' | 'endTurn'
enum AvailableResponse {
  // Game control
  CreateGameResponse = 'createGameResponse',
  JoinGameResponse = 'joinGameResponse',
  StartGameResponse = 'startGameResponse',
  // Game event
  PlayerIdAssignmentResponse = 'playerIdAssignmentResponse',
  DiceRolledResponse = 'diceRolledResponse',
  EndTurnResponse = 'endTurnResponse'
}

function App() {
  const [gameId, setGameId] = useState('')
  const [playerId, setPlayerId] = useState('')

  const connection = useRef<signalR.HubConnection | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);

  const isYourTurn = gameState?.activePlayers[gameState.currentPlayerIndex]?.id === playerId

  useEffect(() => {
    connection.current = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5217/gameHubs")
      .build();

    connection.current.on(AvailableResponse.CreateGameResponse, (gameId: string) => {
      setGameId(gameId)
    });

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

    connection.current.on(AvailableResponse.PlayerIdAssignmentResponse, (gameId: string, game: GameState) => {
      setPlayerId(gameId)
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

    connection.current.on(AvailableResponse.DiceRolledResponse, (_, roll1: number, roll2: number, totalRoll: number, newPosition: number) => {
      setGameState(state => {
        if (!state) throw new Error("No active game")
        return produce(state, draft => {
          // Play animation then change the current phase
          draft.currentPhase = GamePhase.LandingOnSpaceAction
          draft.activePlayers[draft.currentPlayerIndex].currentPosition = newPosition
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
    <div className='w-full'>
      Game ID:{gameId}<br />
      Player ID: {playerId}
      <br />
      <input className='border border-amber-50 px-4 py-2 w-full' value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder='gameId' />
      <br />
      {!gameState &&
        <button onClick={() => {
          sendMessage("createGame")
        }}>
          Create Game
        </button>
      }
      {!gameState && <button onClick={() => {
        sendMessage("joinGame", gameId, crypto.randomUUID());
      }}>
        Join Game
      </button>}
      {gameState?.currentPhase === GamePhase.WaitingForPlayers &&
        <button onClick={() => {
          sendMessage("startGame", gameId);
        }}>
          Start Game
        </button>
      }
      {isYourTurn && <>
        <button onClick={() => {
          sendMessage("rollDice", gameId, playerId);
        }}>
          Roll dice
        </button>
        <button onClick={() => {
          sendMessage("endTurn", gameId, playerId);
        }}>
          End Turn
        </button>
      </>}
      <br />
      Important info:
      {gameState && <>
        <p>
          Player:
          {gameState.activePlayers.map((player, i) =>
            <li key={i}>{player.id.substring(0, 8)} -- pos: {player.currentPosition} -- {gameState.activePlayers[gameState.currentPlayerIndex]?.id === player.id && "CURRENT TURN"}</li>
          )}
        </p>
        <p>Current Game phase: {gameState?.currentPhase}</p>
      </>}

      <ol className='list-decimal'>
        {gameState?.board.spaces.map((space, i) => <li key={space.id}>{i} - {JSON.stringify(space, null, 2)}</li>)}
      </ol>



    </div>
  )
}

export default App
