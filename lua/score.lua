HighScore = HighScore or 0
Player = Player or "na"

Handlers.add(
    "Update",
    Handlers.utils.hasMatchingTag("Action", "Update"),
    function(msg)
        assert(type(msg.score) == 'string', 'score is required!')

        local highScore = tonumber(HighScore)
        local newScore = tonumber(msg.score)
        assert(newScore, 'score must be a valid number!')

        if newScore > highScore then
            HighScore = newScore
            Player = msg.From
        end

        ao.send({
            Target    = msg.From,
            HighScore = HighScore,
            Player    = Player
        })
    end
)

Handlers.add(
    "GetHighScore",
    Handlers.utils.hasMatchingTag("Action", "GetHighScore"),
    function(msg)
        ao.send({
            Target = msg.From,
            HighScore = HighScore,
            Player = Player
        })
    end
)
