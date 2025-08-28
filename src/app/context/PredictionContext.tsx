"use client";

import { Prediction } from "@/models/predictions.model";
import { createContext, useContext, useState } from "react";

const defaultContextValue = {
  latestPrediction: {
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
  setLatestPrediction: (_object: any) => {
    console.warn("PredictionProvider not found!");
  },
};

const PredictionContext = createContext(defaultContextValue);

interface PredictionProviderProps {
  children: React.ReactNode;
}

const PredictionProvider: React.FC<PredictionProviderProps> = ({
  children,
}) => {
  const [latestPrediction, setLatestPrediction] = useState({
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
  });

  const value = {
    latestPrediction,
    setLatestPrediction,
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};

const usePrediction = () => {
  return useContext(PredictionContext);
};

export { PredictionProvider, usePrediction };
