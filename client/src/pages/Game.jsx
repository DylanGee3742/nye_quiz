import { useEffect, useState } from "react"
import { socket } from "../socket"
import { LeaderBoard } from "./Leaderboard"
import { Questions } from "./Questions"
import { usePhase } from "../states/PhaseContext"
import { JoinGame } from "./JoinGame"

export const Game = () => {
    const [gameId, setGameId] = useState("nye")
    const { phase, setPhase } = usePhase()

    useEffect(() => {
        socket.on("quiz:start", (payload) => {
            setPhase("questions")
            setGameId(payload?.gameId ?? payload)
        })

        socket.on("quiz:finished", () => {
            setPhase("leaderboard")
        })

        return () => {
            socket.off("quiz:start")
            socket.off("quiz:finished")
        }
    }, [])


    let content;

    switch (phase) {
        case 'questions':
            content = <Questions gameId={gameId} phone={true} />;
            break;
        case 'leaderboard':
            content = <LeaderBoard gameId={gameId} />;
            break;
        default:
            content = <JoinGame gameId={gameId} />; // or some default component
    }

    return (
        <div>
            {content}
        </div>
    )
}
