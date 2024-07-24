import { useState, useEffect, useRef } from "react"
import { dryrun } from "@permaweb/aoconnect"

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [direction, setDirection] = useState("RIGHT")
  const [gameOver, setGameOver] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [lastKeyPress, setLastKeyPress] = useState(Date.now())
  const canvasRef = useRef(null)

  const cellSize = 20
  const canvasSize = 400
  const debounceTime = 100 // milliseconds

  useEffect(() => {
    const interval = setInterval(() => {
      if (isStarted) moveSnake()
    }, 100)
    document.addEventListener("keydown", changeDirection)
    return () => {
      clearInterval(interval)
      document.removeEventListener("keydown", changeDirection)
    }
  }, [snake, direction, isStarted])

  const moveSnake = () => {
    if (gameOver) return

    const newSnake = [...snake]
    const head = { ...newSnake[0] }

    switch (direction) {
      case "UP":
        head.y -= 1
        break
      case "DOWN":
        head.y += 1
        break
      case "LEFT":
        head.x -= 1
        break
      case "RIGHT":
        head.x += 1
        break
    }

    newSnake.unshift(head)

    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor((Math.random() * canvasSize) / cellSize),
        y: Math.floor((Math.random() * canvasSize) / cellSize),
      })
      setScore((_score) => _score + 1)
    } else {
      newSnake.pop()
    }

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= canvasSize / cellSize ||
      head.y >= canvasSize / cellSize ||
      newSnake
        .slice(1)
        .some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      setGameOver(true)
      setIsStarted(false)
    } else {
      setSnake(newSnake)
    }
  }

  const changeDirection = (event) => {
    const currentTime = Date.now()
    if (currentTime - lastKeyPress < debounceTime) {
      return
    }

    if (!isStarted) {
      setIsStarted(true)
    }

    switch (event.key) {
      case "ArrowUp":
        if (direction !== "DOWN") setDirection("UP")
        break
      case "ArrowDown":
        if (direction !== "UP") setDirection("DOWN")
        break
      case "ArrowLeft":
        if (direction !== "RIGHT") setDirection("LEFT")
        break
      case "ArrowRight":
        if (direction !== "LEFT") setDirection("RIGHT")
        break
    }

    setLastKeyPress(currentTime)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    ctx.clearRect(0, 0, canvasSize, canvasSize)

    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    ctx.fillStyle = "green"
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * cellSize,
        segment.y * cellSize,
        cellSize,
        cellSize
      )
    })

    ctx.fillStyle = "red"
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize)
  }, [snake, food])

  useEffect(() => {
    ;(async () => {
      let tags = [{ name: "Action", value: "GetHighScore" }]
      const result = await dryrun({
        process: "SzpwHbxKb9U_61Qf2w1doGWC8eH2agq27Xk0WqYW-Ks",
        tags,
      })
      console.log("result", result)
      setHighScore(JSON.parse(result.Messages[0].Tags[6].value))
    })()
  }, [gameOver])

  useEffect(() => {
    if (!isStarted && gameOver && score > highScore) {
      console.log("set new high score")
    }
  }, [isStarted])

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>AO Snake</h1>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ border: "1px solid black" }}
      />
      {<div>Score: {score}</div>}
      {<div>Highest Score: {highScore}</div>}
      {gameOver && <div>Game Over!</div>}
    </div>
  )
}

export default SnakeGame
