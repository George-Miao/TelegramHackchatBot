/*
Psuedo-Namespace Bot that was intended to be adding tags to other's message to make it looks like namespaces
I'm dumb
You CANNOT edit other's message
I realized that when I almost finished the basic functions
LMFAO
*/ 

const { Telegraf, Extra, Markup, Context } = require('telegraf')
const shortid = require('shortid')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

const log = ctx => {
  console.log("[+]", `${ctx.from.username}@${ctx.chat.username ?? 'PM'}: ${ctx.message.text ?? ''}`)
}
const replyTo = (msg, ctx) => {
  ctx.reply(msg, Extra.inReplyTo(ctx.message.message_id))
  console.log(`[>] >> ${ctx.message.message_id}: ${msg}`)
}
const contentRegex = /^\/[a-zA-Z]*\s([a-zA-Z\d_\-]*)/
const getContent = ctx => (ctx.message.text.match(contentRegex))?.[1]
const taggingExtra = new Extra({
  disable_web_page_preview: true,
  parse_mode: 'HTML'
})

class NS {
  constructor(name, id,) {
    this.name = name
    this.id = id
    this.tag = `#NS_${name}`
    this.active = true
  }
  toString() {
    return `${this.id}: ${this.tag} | ${this.active ? 'Activated' : 'Deactivated'}`
  }
}

class ActiveUser {
  constructor(user, ns) {
    this.id = user.id
    this.username = user.username
    this.ns = ns
  }
} 

class UserStore {
  constructor() {
    this.kv = {}
  }
  getNS(user) {
    return this.kv[user.id]?.ns
  }
  addUser(user, ns) {
    const activeUser = this.kv[user.id]
    if (activeUser) return activeUser
    return this.kv[user.id] = new ActiveUser(user, ns)
  }
  setUserNS(user, ns) {
    const activeUser = this.kv[user.id]
    if (!activeUser) return
    activeUser.ns = ns
  }
}

class NSStore {
  constructor() {
    this.kv = {}
    this.index = {}
    this.users = new UserStore()
    this.msgs = {}
    this.getOrNewNS('123123')
  }
  getOrNewNS(nsName) {
    const indexed = this.index[nsName]
    if (indexed) return indexed
    const nsID = shortid.generate()
    const ns = new NS(nsName, nsID)
    this.kv[nsID] = ns
    this.index[nsName] = ns
    return ns
  }
  delNS(nsID) {
    const ns = this.kv[nsID]
    if (!ns) return
    this.kv[nsID].active = false
    return ns
  }
  allUsers(){
    return "NS ID : tag\n-----------\n" + Object.values(this.users.kv).map(e => `${e.username}: ${e.ns.tag}`).join("\n")
  }
  allItem() {
    return "NS ID : tag\n-----------\n" + Object.values(this.kv).map(e => e.toString()).join('\n')
  }
  addIndex() {
    return "NS Name : tag\n----------------\n" + Object.entries(this.index).map(e => `${e[0]}: ${e[1].tag}`).join('\n')
  }
}

bot.context.store = new NSStore()

bot.command('using', ctx => {
  log(ctx)
  let nsName = getContent(ctx)
  if (!nsName) replyTo(`Invalid tag. Only char, number and _ is acceptable`, ctx)
  else {
    const ns = ctx.store.getOrNewNS(nsName)
    ctx.store.users.addUser(ctx.from, ns)
    replyTo(`${ns.tag} is up`, ctx)
  }
})

bot.command(['ls', 'list'], ctx => {
  log(ctx)
  ctx.reply(ctx.store.allItem())
})

bot.command(['user', 'users'], ctx => {
  log(ctx)
  ctx.reply(ctx.store.allUsers())
})

bot.command(['del', 'deactive'], async ctx => {
  nsID = getContent(ctx)
  if (!shortid.isValid(nsID)) replyTo("Invalid NS ID, use /ls to find", ctx)
  else {
    const ns = ctx.store.delNS(nsID)
    if (ns) replyTo(`${ns.tag} has been deactivated`, ctx)
    else replyTo(`Cannot find ${nsID}, use /ls to find`, ctx)
  }
})

bot.command('index', ctx => {
  log(ctx)
  ctx.reply(ctx.store.addIndex())
})

bot.hears("hi", ctx => {
  log(ctx)
  ctx.reply("hey")
})

bot.hears(/.*/, ctx => {
  log(ctx)
  const ns = ctx.store.users.getNS(ctx.from)
  if (!ns?.active) return
  else {
    const msgID = ctx.message.message_id
    if (ctx.chat.type !== 'supergroup') link = `<a>${msgID}</a>`
    else link = `<a href="https://t.me/${ctx.chat.username}/${msgID}">${msgID}</a>`
    ctx.reply(`${link} ${ns.tag}`, taggingExtra)
  }
})

console.log("Launching")
bot.launch()