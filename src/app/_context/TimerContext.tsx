"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const TimerContext = createContext<{
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}>({ days: "", hours: "", minutes: "", seconds: "" });

interface TimerProviderProps {
  children: React.ReactNode;
  deadline: Date;
}

const TimerProvider: React.FC<TimerProviderProps> = ({
  children,
  deadline,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: "",
    hours: "",
    minutes: "",
    seconds: "",
  });

  useEffect(() => {
    // Calculate time difference when the component mounts
    calculateTimeDifference(String(deadline));

    // Update the time difference every second
    const intervalId = setInterval(() => {
      calculateTimeDifference(String(deadline));
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [deadline]);

  function calculateTimeDifference(targetDateISOString: string) {
    const targetDate = new Date(targetDateISOString);
    const currentDate = new Date();
    const timeDifference = targetDate.getTime() - currentDate.getTime();

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    const formattedDays = String(days).padStart(2, "0");
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    setTimeLeft({
      days: formattedDays,
      hours: formattedHours,
      minutes: formattedMinutes,
      seconds: formattedSeconds,
    });
  }

  return (
    <TimerContext.Provider value={timeLeft}>{children}</TimerContext.Provider>
  );
};

const useTimer = () => {
  return useContext(TimerContext);
};

export { TimerProvider, useTimer };
