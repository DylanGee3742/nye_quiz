// LeaderboardHost.js
import { useEffect, useState } from "react"
import { Container, Card, ListGroup, Badge, Button } from "react-bootstrap"
import { socket } from "../../socket"
import { usePhase } from "../../states/PhaseContext"

export const LeaderboardHost = ({ gameId, previousRound }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const { setPhase } = usePhase()

  useEffect(() => {
    const handleLeaderboard = (leaderboard) => {
      setLeaderboard(leaderboard)
    }

    socket.on("leaderboard:players", handleLeaderboard)
    socket.emit("quiz:show_leaderboard", { gameId })

    return () => {
      socket.off("leaderboard:players", handleLeaderboard)
    }
  }, [gameId])

  const startNextRound = () => {
    if (previousRound === 'questions') {
      setPhase('polling')
    } else if (previousRound === 'polling') {
      setPhase('music_game')
    } else {
      setPhase('finished')
    }
  }

  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card style={{ width: "26rem" }} className="shadow-sm">
        <Card.Body className="text-center">
          <Card.Title className="fs-3 mb-4">🏆 Leaderboard</Card.Title>

          <ListGroup variant="flush">
            {leaderboard.map((player, index) => {
              const medals = ["🥇", "🥈", "🥉"]
              const rank = medals[index] || `${index + 1}.`

              return (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center py-3"
                >
                  <div className="d-flex align-items-center gap-2">
                    <strong>{rank}</strong>
                    <span>{player.player}</span>
                  </div>

                  <Badge bg="dark" pill>
                    {player.score}
                  </Badge>
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        </Card.Body>
        
        <Card.Footer>
          <Button onClick={startNextRound} variant="primary" className="w-100">
            Start Next Round
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  )
}