import { gameConfigInitial, type GameConfig } from "@/types/GameConfig";
import { createContext } from "react";

export const GameConfigContext = createContext<GameConfig>(gameConfigInitial);
