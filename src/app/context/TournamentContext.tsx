"use client";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface Tournament {
  tournament_id: number;
  name: string;
  description: string;
  banner: string;
  type: string;
  prizePool: number;
  buyInFee: number;
  isActive: boolean;
  startTime: Date;
  endTime: Date;
  auction_ids: string[];
  users: string[];
  maxUsers: number;
  createdAt?: Date;
  updatedAt?: Date;
}
interface TournamentContextType {
  latestTournament: Tournament;
  setLatestTournament: Dispatch<SetStateAction<Tournament>>;
}
const defaultContextValue = {
  latestTournament: {
    tournament_id: 0,
    name: "",
    description: "",
    banner: "",
    type: "",
    prizePool: 0,
    buyInFee: 0,
    isActive: false,
    startTime: new Date(),
    endTime: new Date(),
    auction_ids: [],
    users: [],
    maxUsers: 0,
  },
  setLatestTournament: () => {},
};

const TournamentContext =
  createContext<TournamentContextType>(defaultContextValue);

interface TournamentProviderProps {
  children: React.ReactNode;
}

const TournamentProvider: React.FC<TournamentProviderProps> = ({
  children,
}) => {
  const [latestTournament, setLatestTournament] = useState<Tournament>(
    defaultContextValue.latestTournament
  );

  const value = {
    latestTournament,
    setLatestTournament,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

const useTournament = () => {
  return useContext(TournamentContext);
};
export { TournamentProvider, useTournament };
