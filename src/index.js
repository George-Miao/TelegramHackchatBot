const { bot } = require('./bot')
const Sentry = require("@sentry/node")

require('dotenv').config()

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: "test",
  name: "My First Test Transaction",
});

try {
  bot.launch()
} catch (e) {
  Sentry.captureException(e)
  console.log(`Catastrophic: ${e}`)
} finally {
  transaction.finish()
}