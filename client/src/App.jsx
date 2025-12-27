import { useState } from "react"
import {Quiz} from "./pages/Quiz"
import {Game} from "./pages/Game"

export default function App() {
  const [screen, setScreen] = useState("quiz") // "quiz" or "game"

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
