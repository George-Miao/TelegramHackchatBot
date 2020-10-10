const { Extra } = require('telegraf')
const { randName } = require('./nameGen')
const Sentry = require("@sentry/node")

const log = (msg, pre = 'Sys', warn = false) => {
  console.log(`${warn ? '[!]' : '[+]'}[${pre}][${(new Date()).toISOString()}] ${msg}`)
  if (warn) Sentry.captureMessage(msg);
}

const replyTo = (msg, ctx) => {
  ctx.reply(msg, Extra.inReplyTo(ctx.message.message_id))
  log(`Reply to #${ctx.message.message_id} by ${ctx.from.username}: ${msg}`, 'TG')
}

const contentRegex = /^\/[a-zA-Z]*\s([a-zA-Z\d_]*)/
const getContent = ctx => (ctx.message.text.match(contentRegex))?.[1]

module.exports = {
  log,
  replyTo,
  getContent,
  randName
}