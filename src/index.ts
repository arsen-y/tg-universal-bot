import { initUser } from './helpers/initUser.js'
import TelegramApi from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import Db from 'mysql2-async'
import { Router } from './classes/Router.js'
import { routes } from './routes.js'

dotenv.config()

const router = new Router(routes)

import OpenAI from 'openai'

export const openaiAPI = new OpenAI({
  apiKey: process.env.OPENAIKEY,
})

// const createChatCompletion = async () => {

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: 'system', content: 'You are a helpful assistant.' },
//         { role: 'user', content: 'Who won the world series in 2020?' },
//         { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
//         { role: 'user', content: 'Where was it played?' },
//         { role: 'assistant', content: 'The World Series was played in Arlington, Texas at the Globe Life Field.' },
//       ],
//     });

//     console.log(response.choices[0].message.content);
//   } catch (error) {
//     console.error('Error creating chat completion:', error);
//   }

// };

//createChatCompletion();

export const bot = new TelegramApi(process.env.TGTOKEN, { polling: true })

const commands = [
  {
    command: 'start',
    description: 'Запуск бота',
  },
  {
    command: 'about',
    description: 'О боте',
  },
]

bot.setMyCommands(commands)

export const db = new Db({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  skiptzfix: true,
})

// /////////////////////////////////////////////////////////////////////////////

bot.on('polling_error', (err) => console.log(err.data.error.message))

bot.on('message', async (msg) => {
  try {
    const text = msg.text
    const chatId = msg.chat.id
    const userName = msg.from.first_name
    const fromId = msg.from.id
    const user = await initUser(fromId)

    console.log('user', user)

    let msgText = msg.text

    if (msgText.startsWith('/')) {
      msgText = msgText.toLowerCase()
      msgText = msgText.replace(/\s+/g, ' ').trim()
      let [name, param = ''] = msgText.split(' ', 2)

      name = name.slice(1)

      switch (name) {
        case 'about':
          await router.route(`about ${param}`, msg, user)
          break
        case 'start':
          await router.route('levelsquest', msg, user)
          break
        default:
          await await bot.sendMessage(msg.chat.id, `Вы ввели неизвестную команду.`)
      }
    } else {
      await router.route('levelsquest', msg, user)
    }
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
    await bot.sendMessage(msg.chat.id, `С ботом произошла какая-то ошибка. Попробуйте позже или модифицируйте запрос.`)
  }

  //console.log(msg);
})
