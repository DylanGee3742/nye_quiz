import { useEffect, useState } from "react"
import { socket } from "../socket"
import { Form, Button, Card } from 'react-bootstrap'

export const Quiz = () => {
  const [players, setPlayers] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const gameId = "nye"
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

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
        console.log('question', question)
        setQuestion(question)
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchQuestion()
  }, [gameStarted])


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
      {!gameStarted && <h2 style={{ marginBottom: "20px" }}>Players Joined:</h2>}

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
                    <Form.Check
                      key={i}
                      type="radio"
                      name="question"
                      id={`option-${i}`}
                      label={option}
                      className="mb-3 p-3 border rounded"
                      checked={selectedAnswer === option}
                      onChange={() => setSelectedAnswer(option)}
                    />
                  ))}
                </Form>
              </Card.Body>
            </Card>
          )}
        </div>

      }
    </div>

  )
}
