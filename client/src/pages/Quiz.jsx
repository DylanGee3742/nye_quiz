import { useEffect, useState } from "react"
import { socket } from "../socket"
import { LeaderBoard } from "./Leaderboard"
import { Questions } from "./Questions"
import { HomePage } from "./HomePage"
import { usePhase } from "../states/PhaseContext"

export const Quiz = () => {
  const gameId = "nye"
  const { phase, setPhase } = usePhase()

  useEffect(() => {
    // Join room as host
    socket.emit("host:join", { gameId })

    socket.on("quiz:finished", () => {
      setPhase('leaderboard')
    }) 

    return () => {
      socket.off("player:joined")
    }
  }, [])


  let content;

  switch (phase) {
    case 'questions':
      content = <Questions gameId={gameId} phone={false} />;
      break;
    case 'leaderboard':
      content = <LeaderBoard gameId={gameId} />;
      break;
    default:
      content = <HomePage gameId={gameId} setPhase={setPhase} />;
  }


  return (
    <div>
      {content}
    </div>
  )
}
