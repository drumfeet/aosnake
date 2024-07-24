HighScore = HighScore or 0

Handlers.add(
    "Update",
    Handlers.utils.hasMatchingTag("Action", "Update"),
    function(msg)
        assert(type(msg.score) == 'string', 'score is required!')

        local newScore = tonumber(msg.score)
        assert(newScore, 'score must be a valid number!')

        if newScore > HighScore then
            HighScore = newScore
            Handlers.utils.reply("HighScore updated to " .. newScore)(msg)
        else
            Handlers.utils.reply("Submitted score is not higher than the current HighScore.")(msg)
        end
    end
)

Handlers.add(
    "GetHighScore",
    Handlers.utils.hasMatchingTag("Action", "GetHighScore"),
    function(msg)
        ao.send({
            Target = msg.From,
            HighScore = HighScore
        })
    end
)
