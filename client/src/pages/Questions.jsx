import { useEffect, useState } from "react"
import { socket } from "../socket"
import { Form, Button, Card, Row, Col } from 'react-bootstrap'
import { usePlayers } from "../states/PlayersContext"

export const Questions = ({ phone, gameId }) => {
    const [question, setQuestion] = useState(null)
    const [answerIndex, setAnswerIndex] = useState(null)
    const [answerSubmitted, setAnswerSubmitted] = useState(false)
    const [playersAnswered, setPlayersAnswered] = useState([])
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
    const { players, setPlayers } = usePlayers()

    useEffect(() => {
        // Listen for players joining
        socket.on("player:answer", (player) => {
            setPlayersAnswered(prev => [...prev, player])
        })

        return () => {
            socket.off("player:answer")
        }
    }, [])

    const submitAnswer = (e) => {
        try {
            e.preventDefault()
            socket.emit("player:answer", { gameId, answerIndex })
            setAnswerSubmitted(true)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        const handleQuestion = (question) => {
            setQuestion(question);
            setAnswerSubmitted(false);
            setAnswerIndex(null);
            setCurrentQuestionNumber(prev => prev + 1); // track sequence
        };
    
        socket.on("quiz:question", handleQuestion);
    
        // Only phones request current question
        if (phone && gameId) {
            socket.emit("quiz:get-current-question", { gameId });
        }
    
        return () => socket.off("quiz:question", handleQuestion);
    }, [phone, gameId]);

    useEffect(() => {
        // Only trigger when all players answered and question exists
        if (
            question && // make sure we have a question
            players.length > 0 &&
            playersAnswered.length === players.length
        ) {
            setPlayersAnswered([]);
            socket.emit("quiz:next", { gameId });
            // no need to emit get-current-question here, server will broadcast it
        }
    }, [playersAnswered, players, question, gameId]);
    

    return (
        <>
            {playersAnswered.length > 0 && !phone && (
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

            <Card style={{ maxWidth: "600px", width: "100%" }} className="p-4 shadow mt-4">
                <Card.Body>
                    <Card.Title className="mb-4 text-center">{question?.question}</Card.Title>

                    <Form onSubmit={phone ? submitAnswer : (e) => e.preventDefault()}>
                        {question?.options.map((option, i) =>
                            phone ? (
                                <Form.Check
                                    key={i}
                                    type="radio"
                                    name="question"
                                    id={`option-${i}`}
                                    label={option}
                                    className="mb-3 p-3 border rounded"
                                    checked={answerIndex === i}
                                    onChange={() => setAnswerIndex(i)}
                                    disabled={answerSubmitted}
                                />
                            ) : (
                                <div
                                    key={i}
                                    id={`option-${i}`}
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
                            )
                        )}

                        {phone && (
                            <Button
                                variant="secondary"
                                type="submit"
                                disabled={answerSubmitted || answerIndex === null}
                                className="mt-3"
                            >
                                Submit
                            </Button>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}