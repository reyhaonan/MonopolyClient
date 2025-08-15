import { useAuth } from "@/hooks/useAuth";
import useGameHub from "@/hooks/useGameHub";
import * as GameAPI from "@/services/game";
import { useQuery } from "@tanstack/react-query";
import Board from "../organisms/Board";
import PlayersInfo from "../organisms/PlayersInfo";

type Props = {
  gameId: string;
};

export const GameView = ({ gameId }: Props) => {
  const { data } = useQuery({
    queryKey: ["verifyGame", gameId],
    queryFn: () => GameAPI.verifyGame(gameId),
  });

  const playerId = useAuth();

  const { } = useGameHub(data?.data, playerId || undefined);

  return <main className="container mx-auto flex">
    <div className="flex-1">a</div>
    <div className="">
      <Board />
    </div>
    <div className="flex-1">b</div>
  </main>;
};
