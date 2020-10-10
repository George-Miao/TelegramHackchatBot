const { Telegraf } = require('telegraf')
const { ChatRoomSession } = require('./session')
const { log, replyTo, getContent } = require('./util')
const { helpMsg, startMsg } = require('./msgs')

require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.context.sessions = {}
const getRoomNameFromHashTag = hastag => hastag.match(/^#Room_([a-zA-Z\d_]*)$/)?.[1]

const logCtx = ctx => {
  log(`${ctx.from.username}@${ctx.chat.username ?? 'PM'}: ${ctx.message.text ?? ''}`, 'TG')
}

bot.start(ctx => { logCtx(ctx); ctx.replyWithMarkdown(startMsg) })

bot.help(ctx => { logCtx(ctx); ctx.replyWithMarkdown(helpMsg) })

bot.command(['split', 'new', 'newSession'], ctx => {
  logCtx(ctx)
  name = getContent(ctx)
  const newSession = new ChatRoomSession({
    chat: (session, nick, text) => {
      ctx.reply(`${nick}: ${text}\n${session.tag} `)
    },
    onlineAdd: (session, nick) => {
      ctx.reply(`${nick} joined the room ${session.tag}`)
    },
    onlineRemove: (session, nick) => {
      ctx.reply(`${nick} left the room ${session.tag}`)
    }
  }, name)
  ctx.sessions[newSession.name] = newSession
  const timeout = setInterval(() => {
    if (!newSession.lifeCheck()){
      newSession.close()
      delete ctx.sessions[newSession.name]
      ctx.reply(`${newSession.tag} is going to be deactivated since it's no longer actived.`)
      clearInterval(timeout)
    }
  }, 60000)
  replyTo(`Room ${newSession.tag} created. \nUse ${newSession.url} to join the room.`, ctx)
})

bot.command(['ls', 'list', 'rooms', 'all'], ctx => {
  logCtx(ctx)
  if (Object.keys(ctx.sessions).length == 0) ctx.reply("No rooms found. Use /new to create.")
  else ctx.reply("Rooms\n----------\n" + Object.values(ctx.sessions).join('\n'))
})

bot.command(['del', 'revoke', 'deactivate'], ctx => {
  logCtx(ctx)
  name = getContent(ctx) ?? ""
  if (!name) {
    replyTo("format: /del roomName. Use /ls to see all rooms.", ctx)
    return
  }
  const session = ctx.sessions[name]
  if (!session) {
    replyTo(`Cannot find ${name}. Use /ls to see all rooms.`, ctx)
    return
  }
  session.close()
  replyTo(`${session.tag} has been deactivated`, ctx)
  delete ctx.sessions[name]
})

bot.command('ping', ctx => replyTo('Sir! Yes sir! 好! 很有精神!', ctx))

bot.on("text", ctx => {
  const replied = ctx.message?.reply_to_message
  if (!replied) return
  const tag = replied
    .entities
    ?.filter(e => e.type === 'hashtag')
    ?.[0]
  if (!tag) return
  let txt = replied.text
  const roomName = getRoomNameFromHashTag(txt.substring(tag.offset, tag.offset + tag.length))
  if (!roomName) return
  txt = txt.substring(0, tag.offset).replace('\n', ' ')
  ctx.sessions[roomName]?.chat(
    `@${ctx.from.username} replies to "${txt}":
    ${ctx.message.text}`
  )
})

module.exports = {
  bot
}