// Game.js
import { QuestionsPhone } from "./phones/QuestionsPhone"
import { LeaderboardPhone } from "./phones/LeaderboardPhone"
import { useState } from "react"
import { usePhase } from "../states/PhaseContext"
import { JoinGame } from "./phones/JoinGame"
import { PollingPromptSubmissionPhone } from "./phones/PollingPromptSubmissionPhone"
import { PollingVotingPhone } from "./phones/PollingVotingPhone"

export const Game = () => {
    const [gameId] = useState("nye")
    const { phase } = usePhase()

    // Game.js (Phone)
    switch (phase) {
        case 'questions':
            return <QuestionsPhone gameId={gameId} />
        case 'leaderboard':
            return <LeaderboardPhone gameId={gameId} />
        case 'polling-submit':
            return <PollingPromptSubmissionPhone gameId={gameId} />
        case 'polling-vote':
            return <PollingVotingPhone gameId={gameId} />
        default:
            return <JoinGame gameId={gameId} />
    }
}