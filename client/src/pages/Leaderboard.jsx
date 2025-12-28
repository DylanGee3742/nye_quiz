import { useEffect, useState } from "react"
import { socket } from "../socket"

export const LeaderBoard = ({ gameId, playerList }) => {
  const [scores, setScores] = useState({})
  console.log(playerList)

  useEffect(() => {
    socket.emit("quiz:scores", { gameId })

    socket.on("player:scores", (serverScores) => {
      setScores(serverScores)
    })

    return () => {
      socket.off("player:scores")
    }
  }, [gameId])

  // Merge players + scores
  const leaderboard = playerList
    .map(player => ({
      ...player,
      score: scores.scores[player.id] ?? 1
    }))
    .sort((a, b) => b.score - a.score)

  return (
    <div>
      <h1>🏆 Leaderboard</h1>
      {leaderboard.map((player, index) => (
        <p key={player.id}>
          {index + 1}. {player.name} — {player.score}
        </p>
      ))}
    </div>
  )
}
