const helpMsg = 
`
*Commands*

/help - Show this text  

/new :name - Start a new room session. Name is _Optional_
  Alias: /split & /newSession
    
/ls - List all rooms
  Alias: /list /all /rooms
    
/del :roomName - Deactivate a room. Use /ls to see all room names.
  Alias: /revoke /deactivate
    
You can reply to a reposted message. The bot will repost it to the room.`

const startMsg = 
`Splitroom Bot is used to create temporary split room at [Hackchat](https://Hack.chat)  
Use /new to start or /help for more information`

module.exports = {
  helpMsg,
  startMsg
}