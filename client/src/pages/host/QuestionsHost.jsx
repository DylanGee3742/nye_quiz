// QuestionsHost.js
import { useEffect, useState } from "react"
import { socket } from "../../socket"
import { Card, Row, Col } from 'react-bootstrap'
import { usePlayers } from "../../states/PlayersContext"

export const QuestionsHost = ({ gameId }) => {
    const [question, setQuestion] = useState(null)
    const [playersAnswered, setPlayersAnswered] = useState([])
    const { players } = usePlayers()

    useEffect(() => {
        const handleQuestion = (newQuestion) => {
            console.log("Host received question:", newQuestion.index)
            setQuestion(newQuestion)
            setPlayersAnswered([])
        }

        const handlePlayerAnswer = (player) => {
            setPlayersAnswered(prev => {
                if (prev.some(p => p.player === player.player)) return prev
                return [...prev, player]
            })
        }

        socket.on("quiz:question", handleQuestion)
        socket.on("player:answer", handlePlayerAnswer)

        return () => {
            socket.off("quiz:question", handleQuestion)
            socket.off("player:answer", handlePlayerAnswer)
        }
    }, [])

    // Auto-advance when all players answered
    useEffect(() => {
        if (
            question &&
            players.length > 0 &&
            playersAnswered.length > 0 &&
            playersAnswered.length === players.length
        ) {
            console.log("All players answered, advancing")
            socket.emit("quiz:next", { gameId })
        }
    }, [playersAnswered, players, question, gameId])

    return (
        <>
            {playersAnswered.length > 0 && (
                <div className="mt-3">
                    <h4 className="mb-2">
                        Players Answered: {playersAnswered.length}/{players.length}
                    </h4>
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

            <Card style={{ maxWidth: "600px", width: "100%" }} className="p-4 shadow mt-4">
                <Card.Body>
                    <Card.Title className="mb-4 text-center">
                        {question?.question}
                    </Card.Title>
                    {question?.options.map((option, i) => (
                        <div
                            key={i}
                            className="mb-3 p-3 border rounded"
                            style={{
                                background: "#fff",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                fontSize: "1.1rem",
                                textAlign: "center",
                                minHeight: "50px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </Card.Body>
            </Card>
        </>
    )
}