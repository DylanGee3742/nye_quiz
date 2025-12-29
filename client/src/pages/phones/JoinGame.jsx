import { useState, useEffect } from "react"
import { Form, Button, Container, Spinner } from "react-bootstrap"
import { socket } from "../../socket"
import { usePlayers } from "../../states/PlayersContext"

export const JoinGame = ({ gameId }) => {
    const [name, setName] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const { players, setPlayers } = usePlayers()


    useEffect(() => {
        socket.emit("host:join", { gameId });

        socket.on("player:joined", (playerList) => {
            setPlayers(playerList);
        });

        return () => {
            socket.off("player:joined");
        };
    }, [gameId]);

    const joinGame = (e) => {
        e.preventDefault()
        if (!name.trim()) return alert("Enter your name")
        socket.emit("player:join", { name, gameId })
        setSubmitted(true)
    }

    return (
        <Container style={{ maxWidth: "400px", marginTop: "50px" }}>
            {!submitted ? (
                <Form onSubmit={joinGame}>
                    <h1 className="mb-4 text-center">Enter your name</h1>

                    <Form.Group className="mb-3" controlId="playerName">
                        <Form.Control
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button type="submit" variant="secondary">
                            Submit
                        </Button>
                    </div>
                </Form>
            ) : (
                <div className="text-center">
                    <Spinner animation="border" role="status" className="mb-3">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <h3>Waiting for other players…</h3>
                </div>
            )}
        </Container>
    )
}
