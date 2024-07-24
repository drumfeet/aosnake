HighScore = HighScore or 0

Handlers.add(
    "Update",
    Handlers.utils.hasMatchingTag("Action", "Update"),
    function(msg)
        assert(type(msg.score) == 'string', 'score is required!')
        HighScore = msg.score
        Handlers.utils.reply("HighScore updated to " .. msg.score)(msg)
    end
)

Handlers.add(
    "GetHighScore",
    Handlers.utils.hasMatchingTag("Action", "GetHighScore"),
    function(Msg)
        ao.send({
            Target = Msg.From,
            HighScore = HighScore
        })
    end
)
