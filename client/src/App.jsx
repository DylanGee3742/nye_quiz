// App.js - Centralized phase management
import { useState, useEffect } from "react"
import { Quiz } from "./pages/Quiz"
import { Game } from "./pages/Game"
import { socket } from "./socket"
import { usePhase } from "./states/PhaseContext"

export default function App() {
  const [screen, setScreen] = useState("quiz")
  const { setPhase } = usePhase()

  useEffect(() => {
    // ALL phase changes happen here - both host and phone listen
    const handleQuizStart = () => {
      setPhase("questions")
    }

    const handleQuizFinished = () => {
      setPhase("leaderboard")
    }

    socket.on("quiz:start", handleQuizStart)
    socket.on("quiz:finished", handleQuizFinished)

    return () => {
      socket.off("quiz:start", handleQuizStart)
      socket.off("quiz:finished", handleQuizFinished)
    }
  }, [setPhase])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setScreen("quiz")}>Host / Quiz</button>
        <button onClick={() => setScreen("game")}>Phone / Game</button>
      </div>

      {screen === "quiz" && <Quiz />}
      {screen === "game" && <Game />}
    </div>
  )
}