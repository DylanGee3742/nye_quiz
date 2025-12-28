import { useEffect, useState } from "react"
import { socket } from "../socket"
import { Form, Button, Card } from 'react-bootstrap'


export const Game = () => {
    const [name, setName] = useState("")
    const [gameId, setGameId] = useState("nye")
    const [submitted, setSubmitted] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [question, setQuestion] = useState(null)
    const [answerIndex, setAnswerIndex] = useState(null)
    const [answerSubmitted, setAnswerSubmitted] = useState(false)

    const fetchQuestion = async () => {
        try {
            socket.on("quiz:question", (question) => {
                setQuestion(question)
                setAnswerSubmitted(false)
                setAnswerIndex(null)
            })
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        socket.on("quiz:start", (gameId) => {
            setGameStarted(true)
            setGameId(gameId)
        })
    })

    useEffect(() => {
        fetchQuestion()
    }, [gameStarted])

    const joinGame = (e) => {
        try {
            e.preventDefault()
            if (!name.trim()) return alert("Enter your name")
            socket.emit("player:join", { name, gameId })
            setSubmitted(true)
        } catch (e) {
            console.error(e)
        }
    }

    const submitAnswer = (e) => {
        try {
            e.preventDefault()
            socket.emit("player:answer", { gameId, answerIndex })
            setAnswerSubmitted(true)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            {!submitted ? (
                <form onSubmit={joinGame}>
                    <h1>Enter your name</h1>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button type='submit'>Submit your name</button>
                </form>
            ) : (
                <div>
                    {question && (
                        <>
                            <div className="d-flex justify-content-center mt-5">
                                {question && (
                                    <Card style={{ maxWidth: "600px", width: "100%" }} className="p-4 shadow">
                                        <Card.Body>
                                            <Card.Title className="mb-4 text-center">
                                                {question.question}
                                            </Card.Title>

                                            <Form onSubmit={submitAnswer}>
                                                {question.options.map((option, i) => (
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
                                                ))}
                                                <Button variant="secondary" type="submit" disabled={answerSubmitted}>Submit</Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );


}
