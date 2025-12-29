// QuestionsPhone.js
import { useEffect, useState, useRef } from "react"
import { socket } from "../../socket"
import { Form, Button, Card } from 'react-bootstrap'

export const QuestionsPhone = ({ gameId }) => {
    const [question, setQuestion] = useState(null)
    const [answerIndex, setAnswerIndex] = useState(null)
    const [answerSubmitted, setAnswerSubmitted] = useState(false)
    const hasRequestedQuestion = useRef(false)

    useEffect(() => {
        const handleQuestion = (newQuestion) => {
            console.log("Phone received question:", newQuestion.index)
            setQuestion(newQuestion)
            setAnswerSubmitted(false)
            setAnswerIndex(null)
            hasRequestedQuestion.current = false
        }

        socket.on("quiz:question", handleQuestion)

        // Request current question on mount
        if (!hasRequestedQuestion.current) {
            hasRequestedQuestion.current = true
            socket.emit("quiz:get-current-question", { gameId })
        }

        return () => socket.off("quiz:question", handleQuestion)
    }, [gameId])

    const submitAnswer = (e) => {
        e.preventDefault()
        socket.emit("player:answer", { gameId, answerIndex })
        setAnswerSubmitted(true)
    }

    return (
        <Card style={{ maxWidth: "600px", width: "100%" }} className="p-4 shadow mt-4">
            <Card.Body>
                <Card.Title className="mb-4 text-center">
                    {question?.question}
                </Card.Title>

                <Form onSubmit={submitAnswer}>
                    {question?.options.map((option, i) => (
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

                    <Button
                        variant="secondary"
                        type="submit"
                        disabled={answerSubmitted || answerIndex === null}
                        className="mt-3"
                    >
                        {answerSubmitted ? "Submitted ✓" : "Submit"}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    )
}