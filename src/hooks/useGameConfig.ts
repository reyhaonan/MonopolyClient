import { GameConfigContext } from "@/context/GameConfigContext";
import { useContext } from "react";

export const useGameConfig = () => {
  return useContext(GameConfigContext);
};
