// PhaseContext.js
import { createContext, useContext, useState } from 'react';

const PhaseContext = createContext();

export const PhaseProvider = ({ children }) => {
  const [phase, setPhase] = useState('home'); // default phase

  return (
    <PhaseContext.Provider value={{ phase, setPhase }}>
      {children}
    </PhaseContext.Provider>
  );
};

// custom hook for convenience
export const usePhase = () => useContext(PhaseContext);
