// App.js - Don't auto-join for players
import { useState, useEffect } from "react"
import { Quiz } from "./pages/Quiz"
import { Game } from "./pages/Game"
import { socket } from "./socket"
import { usePhase } from "./states/PhaseContext"

export default function App() {
  const [screen, setScreen] = useState("quiz")
  const [gameId] = useState("nye")
  const { setPhase } = usePhase()

  useEffect(() => {
    // Only auto-join for host
    if (screen === "quiz") {
      socket.emit("host:join", { gameId })
    }
    // For game/phone, they join when they submit their name in JoinGame

    const handleQuizStart = () => {
      console.log("Quiz starting")
      setPhase("questions")
    }

    const handleQuizFinished = () => {
      console.log("Quiz finished")
      setPhase("leaderboard")
    }

    const handleHostLeaderboard = () => {
      setPhase("leaderboard")
    }

    socket.on("quiz:start", handleQuizStart)
    socket.on("quiz:finished", handleQuizFinished)
    socket.on("show_leaderboard", handleHostLeaderboard)

    return () => {
      socket.off("quiz:start", handleQuizStart)
      socket.off("quiz:finished", handleQuizFinished)
      socket.off("show_leaderboard", handleHostLeaderboard)
    }
  }, [setPhase, screen, gameId])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setScreen("quiz")}>Host / Quiz</button>
        <button onClick={() => setScreen("game")}>Phone / Game</button>
      </div>

      {screen === "quiz" && <Quiz gameId={gameId} />}
      {screen === "game" && <Game gameId={gameId} />}
    </div>
  )
}