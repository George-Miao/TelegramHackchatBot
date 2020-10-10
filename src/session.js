const HackChat = require("hack-chat")
const { log, randName } = require('./util')

const HC = new HackChat()

class ChatRoomSession {
  nick = "PopsBot"
  constructor(hooks = {}, name){
    this.name = name || randName()
    this.tag = "#Room_" + this.name
    this.hooks = hooks
    this.userCount = 0
    this.lastActiveTime = Date.now()
    this.session = this.setupHCSession()
    this.url = `https://hack.chat?${this.name}`
    log(`Constructing new session <${this.name}>`, 'Hackchat')
  }node 
  setupHCSession(){
    const session = HC.join(this.name, this.nick)
    session.on("onlineSet", () => {
      log(`Joined new room ${this.url}`, 'Hackchat')
      session.sendMessage("New Split Room Created")
    })
    session.on("onlineAdd", (nick, time) => {
      log(`${nick} joind at server side time ${(new Date(time).toISOString())}`, 'Hackchat')
      session.sendMessage(
        `@${nick} Hi! Welcome to the split room. 
        All message you send here will be reposted to the TG group!`
      )
      this.userCount++
      this.hooks?.onlineAdd?.(this, nick, time)
    })
    session.on("onlineRemove", (nick, time) => {
      log(`${nick} left at server side time ${(new Date(time).toISOString())}`, 'Hackchat'),
      this.userCount--
      this.hooks?.onlineRemove?.(this, nick, time)
    })
    session.on("chat", (nick, text, time, isAdmin, trip) => {
      log(`${nick}(${isAdmin ? 'Admin' : 'User'}): ${text}`, 'Hackchat')
      const hook = this.hooks?.chat
      this.lastActiveTime = Date.now()
      if (hook && nick !== this.nick) hook(this, nick, text, time, isAdmin, trip)
    })
    session.on("left", () => {
      log(`Leaving room ${this.url}. Session will be disabled.`, 'Hackchat')
    })
    session.on("info", text => {
      log(text)
    })
    session.on("warn", text => {
      log(text, 'Hackchat', true)
    })
    return session
  }
  close(){
    this.session.sendMessage(
      `This room has been deactivated. The bot will leave. 
      However, you can still chat but no furthur message will be reposted.`
    )
    this.session.leave()
  }
  chat(msg){
    this.session.sendMessage(msg)
  }
  lifeCheck(){
    const active = this.userCount > 0 || this.lastActiveTime - Date.now() <= 1800000
    log(`${this.name} Lifechecked. Status: ${active ? 'Active' : 'Inactive'}`, 'Hackchat')
    return active
  }
  toString(){
    return `${this.name}(${this.userCount}): ${this.url}`
  }
}

module.exports = {
  ChatRoomSession
}