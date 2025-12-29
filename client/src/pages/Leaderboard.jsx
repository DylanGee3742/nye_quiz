import { useEffect, useState } from "react"
import { Container, Card, ListGroup, Badge } from "react-bootstrap";
import { socket } from "../socket"

export const LeaderBoard = ({ gameId }) => {
  const [leaderboard, setLeaderboard] = useState([])

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



  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card style={{ width: "26rem" }} className="shadow-sm">
        <Card.Body className="text-center">
          <Card.Title className="fs-3 mb-4">🏆 Leaderboard</Card.Title>

          <ListGroup variant="flush">
            {leaderboard.map((player, index) => {
              const medals = ["🥇", "🥈", "🥉"];
              const rank = medals[index] || index + 1;

              return (
                <ListGroup.Item
                  key={player.id}
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
              );
            })}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );

}
