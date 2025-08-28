"use client";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface TournamentPrediction {
  auction_id: string;
  predictedPrice: number;
  predictionType: string;
  user: {
    userId: string;
    fullName: string;
    username: string;
    role: string;
  };
  isActive: boolean;
}
interface TournamentPredictionContextType {
  latestTournamentPredictions: TournamentPrediction[];
  setLatestTournamentPredictions: Dispatch<
    SetStateAction<TournamentPrediction[]>
  >;
}
const defaultContextValue = {
  latestTournamentPredictions: [
    {
      auction_id: "",
      predictedPrice: 0,
      predictionType: "",
      user: {
        userId: "",
        fullName: "",
        username: "",
        role: "",
      },
      isActive: true,
    },
  ],
  setLatestTournamentPredictions: () => {},
};

const TournamentPredictionContext =
  createContext<TournamentPredictionContextType>(defaultContextValue);

interface TournamentPredictionProviderProps {
  children: React.ReactNode;
}

const TournamentPredictionProvider: React.FC<
  TournamentPredictionProviderProps
> = ({ children }) => {
  const [latestTournamentPredictions, setLatestTournamentPredictions] =
    useState<TournamentPrediction[]>([
      {
        auction_id: "",
        predictedPrice: 0,
        predictionType: "",
        user: {
          userId: "",
          fullName: "",
          username: "",
          role: "",
        },
        isActive: true,
      },
    ]);

  const value = {
    latestTournamentPredictions,
    setLatestTournamentPredictions,
  };

  return (
    <TournamentPredictionContext.Provider value={value}>
      {children}
    </TournamentPredictionContext.Provider>
  );
};

const useTournamentPredictions = () => {
  return useContext(TournamentPredictionContext);
};

export { TournamentPredictionProvider, useTournamentPredictions };
