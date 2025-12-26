import { useEffect, useState } from "react"
import { socket } from "../socket"

export const Quiz = () => {
  const [players, setPlayers] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const gameId = "nye"

  useEffect(() => {
    // Join room as host
    socket.emit("host:join", { gameId })

    // Listen for players joining
    socket.on("player:joined", (playerList) => {
      setPlayers(playerList)
    })

    return () => {
      socket.off("player:joined")
    }
  }, [])

  const startQuiz = () => {
    setGameStarted(true)
    socket.emit("quiz:start", { gameId })
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f0f8ff",
        padding: "20px"
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🎉 NYE Quiz 🎉</h1>
      <h2 style={{ marginBottom: "20px" }}>Players Joined:</h2>

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
        {players.length > 0 ? (
          players.map((player) => (
            <div
              key={player.id}
              style={{
                padding: "15px 25px",
                borderRadius: "10px",
                background: "#ffffff",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                fontSize: "1.2rem",
                minWidth: "120px",
                textAlign: "center"
              }}
            >
              {player.name}
            </div>
          ))
        ) : (
          <p style={{ fontSize: "1.2rem", color: "#555" }}>No players yet...</p>
        )}
      </div>

      {!gameStarted && (
        <button
          onClick={startQuiz}
          style={{
            marginTop: "40px",
            padding: "15px 30px",
            fontSize: "1.5rem",
            borderRadius: "10px",
            border: "none",
            background: "#ff6347",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
          }}
        >
          Start Quiz
        </button>
      )}
    </div>
  )
}
