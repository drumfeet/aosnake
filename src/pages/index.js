import { useState, useEffect, useRef } from "react"
import {
  dryrun,
  message,
  createDataItemSigner,
  result,
} from "@permaweb/aoconnect"
import { Button, Flex, Heading, Text, useToast } from "@chakra-ui/react"

const PROCESS_ID = "Y3o0iN2XUY2pMcdvJw4N7Rjbx9GwGz7hzSv5341k8CU"

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [player, setPlayer] = useState("na")
  const [direction, setDirection] = useState("RIGHT")
  const [gameOver, setGameOver] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [lastKeyPress, setLastKeyPress] = useState(Date.now())
  const canvasRef = useRef(null)

  const cellSize = 20
  const canvasSize = 400
  const debounceTime = 100 // milliseconds

  const toast = useToast()

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

  const getHighScore = async () => {
    let tags = [{ name: "Action", value: "GetHighScore" }]
    const result = await dryrun({
      process: PROCESS_ID,
      tags,
    })
    console.log("getHighScore result", result)
    setHighScore(JSON.parse(result.Messages[0].Tags[6].value))
    setPlayer(result.Messages[0].Tags[7].value)
  }

  const submitScore = async () => {
    try {
      await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
    } catch (e) {
      console.error("Wallet missing!", e)
      toast({
        description: "Install ArConnect Wallet at arconnect.io",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      const messageId = await message({
        process: PROCESS_ID,
        tags: [
          { name: "Action", value: "Update" },
          { name: "score", value: score.toString() },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      })
      const _res = await result({
        message: messageId,
        process: PROCESS_ID,
      })
      console.log("submitScore _res", _res)
      const _highScore = JSON.parse(_res.Messages[0].Tags[6].value)
      const _player = _res.Messages[0].Tags[7].value

      toast({
        description: `${_player} has the top score: ${_highScore}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (e) {
      console.error("submitScore error!", e)
    }
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
      await getHighScore()
    })()
  }, [gameOver])

  return (
    <Flex minH="100%" direction="column" gap={14} p={4}>
      <Flex alignItems="center" flexDirection="column">
        <Flex flexDirection="column">
          <Heading paddingY={8}>AO Snake</Heading>
          <Flex>
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              style={{ border: "1px solid black" }}
            />
          </Flex>
          <Text>Your Score: {score}</Text>
          <Text>Top Score: {highScore}</Text>
          <Text>Top Player:</Text>
          <Text>{player}</Text>
          {gameOver && (
            <>
              <Flex flexDirection="column">
                <Heading>Game Over!</Heading>
                <Button onClick={submitScore} variant="outline">
                  Submit Score
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default SnakeGame
