import { useEffect, useRef, useState } from 'react'
import './App.css'

import * as signalR from '@microsoft/signalr'
import { produce } from 'immer'
import { GamePhase } from './types/GamePhase'

type AvailableTask = 'createGame' | 'joinGame' | 'startGame' | 'rollDice'
enum AvailableResponse {
  // Game control
  CreateGameResponse = 'createGameResponse',
  JoinGameResponse = 'joinGameResponse',
  StartGameResponse = 'startGameResponse',
  // Game event
  PlayerIdAssignmentResponse = 'playerIdAssignmentResponse',
  DiceRolledResponse = 'diceRolledResponse'
}

function App() {
  const [gameId, setGameId] = useState('')
  const [playerId, setPlayerId] = useState('')

  const connection = useRef<signalR.HubConnection | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);

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

    connection.current.on(AvailableResponse.StartGameResponse, (_, firstPlayerIndex: number) => {
      setGameState(state => {
        if (!state) throw new Error("No active game")
        return produce(state, draft => {
          draft.currentPhase = GamePhase.PlayerTurnStart
          draft.currentPlayerIndex = firstPlayerIndex
        })
      })
    });

    connection.current.on(AvailableResponse.DiceRolledResponse, (_, roll1: number, roll2: number, totalRoll: number, newPosition: number) => {
      setGameState(state => {
        if (!state) throw new Error("No active game")
        return produce(state, draft => {
          draft.currentPhase = GamePhase.PlayerTurnStart
          draft.activePlayers[draft.currentPlayerIndex].currentPosition = newPosition
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
      {gameState && <>
        <button onClick={() => {
          sendMessage("rollDice", gameId, playerId);
        }}>
          Roll dice
        </button>
      </>}
      <br />
      Important info:
      {gameState && <>
        <p>
          Player:
          {gameState.activePlayers.map((player, i) =>
            <li key={i}>{player.id.substring(0, 8)} -- pos: {player.currentPosition}</li>
          )}
        </p>
        <p>Current Game phase: {gameState?.currentPhase}</p>
        <p>Current player: {gameState.currentPlayerIndex} - {gameState.activePlayers[gameState.currentPlayerIndex]?.id}</p>
      </>}



    </div>
  )
}

export default App
