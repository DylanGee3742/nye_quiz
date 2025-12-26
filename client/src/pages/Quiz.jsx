import { useEffect, useState } from "react"
import { socket } from "../socket"
import { questions } from "../data/questions"

export const Quiz = () => {
    const [players, setPlayers] = useState(false)

    useEffect(() => {
        socket.on("player:join", (playerList) => {
            setPlayers(playerList)
        })
    })

    return (
        <div>
          {players.map((player, index) => (
            <h1 key={index}>{player.name}</h1>
          ))}
        </div>
      )
      
}
