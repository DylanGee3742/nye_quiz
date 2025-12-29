import { useEffect, useState } from "react";
import { socket } from "../socket";
import { Card, Row, Col } from "react-bootstrap";
import { usePlayers } from "../states/PlayersContext";

export const HostQuestions = ({ gameId }) => {
  const [question, setQuestion] = useState(null);
  const [playersAnswered, setPlayersAnswered] = useState([]);
  const { players } = usePlayers();

  // Listen for new questions from server
  useEffect(() => {
    const handleQuestion = (question) => {
      setQuestion(question);
      setPlayersAnswered([]); // reset answers for new question
    };

    socket.on("quiz:question", handleQuestion);

    return () => socket.off("quiz:question", handleQuestion);
  }, []);

  // Listen for players answering
  useEffect(() => {
    const handlePlayerAnswer = (player) => {
      setPlayersAnswered((prev) => {
        // avoid duplicates
        if (!prev.find((p) => p.id === player.id)) {
          return [...prev, player];
        }
        return prev;
      });
    };

    socket.on("player:answer", handlePlayerAnswer);
    return () => socket.off("player:answer", handlePlayerAnswer);
  }, []);

  // Auto-move to next question when all players answered
  useEffect(() => {
    if (players.length > 0 && playersAnswered.length === players.length) {
      console.log("All players answered, moving to next question");
      socket.emit("quiz:next", { gameId }); // server will broadcast next question
      setPlayersAnswered([]); // reset for next round
    }
  }, [playersAnswered, players, gameId]);

  return (
    <>
      {playersAnswered.length > 0 && (
        <div className="mt-3">
          <h4 className="mb-2">Players Answered:</h4>
          <Row className="g-2">
            {playersAnswered.map((player, i) => (
              <Col key={i} xs={6} sm={4} md={3} lg={2}>
                <div
                  className="p-2 text-center border rounded"
                  style={{ backgroundColor: "#f7f7f7" }}
                >
                  {player.name}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <Card style={{ maxWidth: "600px", width: "100%" }} className="p-4 shadow mt-4">
        <Card.Body>
          <Card.Title className="mb-4 text-center">{question?.question}</Card.Title>
          <Row>
            {question?.options.map((option, i) => (
              <Col key={i} xs={12} className="mb-3">
                <div
                  className="p-3 border rounded text-center"
                  style={{
                    background: "#fff",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    fontSize: "1.1rem",
                    minHeight: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {option}
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};
