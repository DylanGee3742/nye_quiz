// Game.js
import { QuestionsPhone } from "./phones/QuestionsPhone"
import { LeaderboardPhone } from "./phones/LeaderboardPhone"
import { useState } from "react"
import { usePhase } from "../states/PhaseContext"
import { JoinGame } from "./phones/JoinGame"

export const Game = () => {
    const [gameId] = useState("nye")
    const { phase } = usePhase()

    switch (phase) {
        case 'questions':
            return <QuestionsPhone gameId={gameId} />
        case 'leaderboard':
            return <LeaderboardPhone gameId={gameId} />
        default:
            return <JoinGame gameId={gameId} />
    }
}