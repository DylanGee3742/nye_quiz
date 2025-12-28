import { useEffect, useState } from "react"
import { socket } from "../socket"
import { Form, Button, Card, ListGroup, Badge, Container, Row, Col } from 'react-bootstrap'

export const Quiz = () => {
  const [players, setPlayers] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const gameId = "nye"
  const [question, setQuestion] = useState(null)
  const [playersAnswered, setPlayersAnswered] = useState([])
  const [scores, setScores] = useState([])

  useEffect(() => {
    // Join room as host
    socket.emit("host:join", { gameId })

    // Listen for players joining
    socket.on("player:joined", (playerList) => {
      setPlayers(playerList)
    })

    return () => {
      socket.off("player:joined")
    }
  }, [])

  const startQuiz = () => {
    setGameStarted(true)
    socket.emit("quiz:start", { gameId })
  }

  const fetchQuestion = async () => {
    try {
      socket.on("quiz:question", (question) => {
        setQuestion(question)
      })
    } catch (e) {
      console.error(e)
    }
  }


  useEffect(() => {
    fetchQuestion()
  }, [gameStarted])

  useEffect(() => {

    // Listen for players joining
    socket.on("player:answer", (player) => {
      setPlayersAnswered(prev => [...prev, player])
    })

    return () => {
      socket.off("player:answer")
    }
  }, [])

  useEffect(() => {
    if (players.length == playersAnswered.length && gameStarted) {
      socket.emit("quiz:next", { gameId })
      setPlayersAnswered([])
      fetchQuestion()
    }
  }, [playersAnswered])

  const getScores = () => {
    try {
      socket.emit("quiz:scores", { gameId })
      socket.on("player:scores", (scores) => {
        setScores()
      })
    } catch (e) {
      console.error(e)
    }
  }


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f0f8ff",
        padding: "20px"
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🎉 NYE Quiz 🎉</h1>
      {!gameStarted && (
        <h2 className="mb-3 text-center">Players Joined</h2>
      )}


      <Container className="mt-4">
        {!gameStarted && (
          <h2 className="mb-3 text-center">Players Joined</h2>
        )}

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
                    {player.player}
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>



      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
        {players.length > 0 && !gameStarted && (
          players.map((player) => (
            <div
              key={player.id}
              style={{
                padding: "15px 25px",
                borderRadius: "10px",
                background: "#ffffff",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                fontSize: "1.2rem",
                minWidth: "120px",
                textAlign: "center"
              }}
            >
              {player.name}
            </div>
          ))
        )}
      </div>

      {!gameStarted ? (
        <Button
          variant="secondary"
          onClick={startQuiz}
        >
          Start Quiz
        </Button>
      ) :
        <div className="d-flex justify-content-center mt-5">
          {question && (
            <Card style={{ maxWidth: "600px", width: "100%" }} className="p-4 shadow">
              <Card.Body>
                <Card.Title className="mb-4 text-center">
                  {question.question}
                </Card.Title>

                <Form>
                  {question.options.map((option, i) => (
                    <div
                      key={i}
                      id={`option-${i}`}
                      label={option}
                      className="mb-3 p-3 border rounded"
                    >
                      {option}
                    </div>
                  ))}
                </Form>
              </Card.Body>
              <Card.Footer>
                <Button onClick={getScores}>Get Scores</Button>
              </Card.Footer>
            </Card>
          )}
        </div>

      }
    </div>

  )
}
