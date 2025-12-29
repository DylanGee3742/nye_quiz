// PhaseContext.js
import { createContext, useContext, useState } from 'react';

const PlayersContext = createContext();

export const PlayersProvider = ({ children }) => {
  const [players, setPlayers] = useState([]); // default Players

  return (
    <PlayersContext.Provider value={{ players, setPlayers }}>
      {children}
    </PlayersContext.Provider>
  );
};

// custom hook for convenience
export const usePlayers = () => useContext(PlayersContext);
