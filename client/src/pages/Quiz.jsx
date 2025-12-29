// Quiz.js
import { useEffect } from "react"
import { LeaderboardHost } from "./host/LeaderboardHost"
import { QuestionsHost } from "./host/QuestionsHost"
import { usePhase } from "../states/PhaseContext"
import { HomePage } from "./host/HomePage"
import { socket } from "../socket"
import { PollingPromptSubmissionHost } from "./host/PollingPromptSubmissionHost"
import { PollingVotingHost } from "./host/PollingVotingHost"

export const Quiz = () => {
  const gameId = "nye"
  const { phase } = usePhase()

  useEffect(() => {
    socket.emit("host:join", { gameId })
  }, [])
  // Quiz.js (Host)
  switch (phase) {
    case 'questions':
      return <QuestionsHost gameId={gameId} />
    case 'leaderboard':
      return <LeaderboardHost gameId={gameId} previousRound="questions" />
    case 'polling-submit':
      return <PollingPromptSubmissionHost gameId={gameId} />
    case 'polling-vote':
      return <PollingVotingHost gameId={gameId} />
    default:
      return <HomePage gameId={gameId} />
  }
}