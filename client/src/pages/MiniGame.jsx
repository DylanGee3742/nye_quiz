const [mode, setMode] = useState('public')
const [privateMessage, setPrivateMessage] = useState('')


{
    mode === "private" && (
        <div>
            <h1>{privateMessage}</h1>
            <button onClick={() => setMode('public')}>Continue</button>
        </div>
    )
}


useEffect(() => {
    socket.on("private:prompt", (data) => {
        setPrivateMessage(data.message)
        setMode("private")
    })

    return () => socket.off("private:prompt")
}, [])



  const pickPerson = () => {
    try {
      socket.emit("quiz:random_task", { gameId })
    } catch (e) {
      console.log(e)
    }
  }
