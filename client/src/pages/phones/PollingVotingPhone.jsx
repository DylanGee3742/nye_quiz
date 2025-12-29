
import { useEffect, useState } from "react"
import { Form, Button, Card, Row, Col, Container, ListGroup, Badge } from 'react-bootstrap'
import { socket } from "../../socket"
import { usePlayers } from "../../states/PlayersContext"

export const PollingVotingPhone = ({ gameId }) => {
    const [currentPrompt, setCurrentPrompt] = useState(null)
    const [selectedPlayer, setSelectedPlayer] = useState(null)
    const [voted, setVoted] = useState(false)
    const { players } = usePlayers()


    useEffect(() => {
        console.log("Phone prompt listener mounted")
      
        const handlePrompt = (promptData) => {
          console.log("Phone received prompt:", promptData)
        }
      
        socket.on("polling:current-prompt", handlePrompt)
      
        return () => {
          socket.off("polling:current-prompt", handlePrompt)
        }
      }, [])

      useEffect(() => {
        socket.emit("polling:get-current-prompt", { gameId })
      }, [])
      

    const castVote = (e) => {
        e.preventDefault()
        if (!selectedPlayer) return alert("Please select a player")
        
        socket.emit("polling:cast-vote", { 
            gameId, 
            promptId: currentPrompt.id,
            votedFor: selectedPlayer 
        })
        setVoted(true)
    }

    return (
        <Container style={{ maxWidth: "500px", marginTop: "50px" }}>
            <Card className="p-4 shadow">
                <Card.Body>
                    <Card.Title className="text-center mb-3">
                        Who's Most Likely To...
                    </Card.Title>

                    <div className="text-center mb-4 p-3 bg-light rounded">
                        <h5>{currentPrompt?.prompt}</h5>
                    </div>

                    {!voted ? (
                        <Form onSubmit={castVote}>
                            <div className="mb-3">
                                {players.map((player, i) => (
                                    <Form.Check
                                        key={i}
                                        type="radio"
                                        name="player"
                                        id={`player-${i}`}
                                        label={player.name}
                                        className="mb-2 p-3 border rounded"
                                        checked={selectedPlayer === player.name}
                                        onChange={() => setSelectedPlayer(player.name)}
                                    />
                                ))}
                            </div>

                            <Button 
                                variant="secondary" 
                                type="submit" 
                                className="w-100"
                                disabled={!selectedPlayer}
                            >
                                Vote
                            </Button>
                        </Form>
                    ) : (
                        <div className="text-center">
                            <div className="mb-3">✓</div>
                            <h5>Vote Cast!</h5>
                            <p className="text-muted">Waiting for others...</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    )
}