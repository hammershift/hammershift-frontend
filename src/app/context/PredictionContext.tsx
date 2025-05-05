"use client"

import { createContext, useContext, useState } from "react";

const defaultContextValue = {
    latestPrediction: {
        carId: "",
        carObjectId: "",
        predictedPrice: 0,
        predictionType: "",
        user: {
            fullName: "",
            username: ""
        }
    },
    setLatestPrediction: (_object: any) => { console.warn('PredictionProvider not found!') }
}

const PredictionContext = createContext(defaultContextValue);

interface PredictionProviderProps {
    children: React.ReactNode;
}

const PredictionProvider: React.FC<PredictionProviderProps> = ({
    children
}) => {
    const [latestPrediction, setLatestPrediction] = useState({
        carId: "",
        carObjectId: "",
        predictedPrice: 0,
        predictionType: "",
        user: {
            fullName: "",
            username: ""
        }
    })

    const value = {
        latestPrediction,
        setLatestPrediction
    }

    return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>
}

const usePrediction = () => {
    return useContext(PredictionContext)
}

export { PredictionProvider, usePrediction };
