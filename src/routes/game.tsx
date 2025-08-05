import { GameView } from '@/components/pages/GameView'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const GameRoomSearch = z.object({
  room: z.guid()
})

export const Route = createFileRoute('/game')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { room: string } => {
    return GameRoomSearch.parse(search)
  }
})

function RouteComponent() {

  const { room } = Route.useSearch()
  return <GameView gameId={room} />
}
