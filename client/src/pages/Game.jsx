import { useEffect, useState } from "react"
import { socket } from "../socket"

export const Game = () => {
    const [name, setName] = useState("")
    const [gameId, setGameId] = useState(1)
    const [submitted, setSubmitted] = useState(false)

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
                <h1>{name}</h1>
            )}
        </>
    );
    

}
