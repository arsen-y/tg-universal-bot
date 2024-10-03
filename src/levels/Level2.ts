import { bot, db, openaiAPI } from '../index.js'
import { AbstractMiddleware } from '../classes/AbstractMiddleware.js'
import { User } from '../classes/User.js'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { sendAIReq } from '../helpers/sendAIReq.js'

export class Level2 extends AbstractMiddleware {
  override async handle(msg: any, user: User) {
    if (!(await super.handle(msg, user))) return false

    console.log('level 2')

    if (user.level > 2) {
      return true
    }

    if (!user.levelInitialized) {
      user.levelInitialized = true
      await db.update('UPDATE users SET level_initialized=? WHERE id=?', [1, user.userId])

      await bot.sendMessage(
        msg.chat.id,
        `У вас второй уровень в чате. Для повышения уровня вам необходимо правильно ответить на загадку от чата GPT.`,
      )

      // создадим для юзера контекст с загадкой от чата

      const history: ChatCompletionMessageParam[] = [
        { role: 'system', content: 'Ты полезный ассистент и собеседник.' },
        {
          role: 'user',
          content:
            'Загадай мне интересную загадку, не математическую. На какую-то общую, гуманитарную тему. Ответ должен быть в пределах двух слов. Если я отвечу правильно, напиши просто "yes", если неправильно, направь меня, дай подсказки.',
        },
      ]

      let chatResponse = await sendAIReq(history, user)

      await bot.sendMessage(msg.chat.id, chatResponse)

      return false
    }

    if (msg.text.length < 3 || msg.text.length > 50) {
      await bot.sendMessage(
        msg.chat.id,
        `Некорректная длина сообщения. Длина должна быть от 3 до 50 символов. Сейчас длина вашего сообщения составляет ${msg.text.length} символов.`,
      )
      return false
    }

    user.chatContext.push({
      role: 'user',
      content: `${msg.text}
      Если я ответил правильно, напиши просто "yes", если неправильно, направь меня, дай подсказки.`,
    })

    let chatResponse = await sendAIReq(user.chatContext, user)

    if (/yes/i.test(chatResponse)) {
      // пользователь решил загадку

      await bot.sendMessage(msg.chat.id, `Вы дали верный ответ. Повышаем ваш level в чате до третьего.`)
      user.level = 3
      user.levelInitialized = false
      await db.update('UPDATE users SET level=?, level_initialized=0 WHERE id=?', [3, user.userId])

      return true
    }

    // пользователь не решил задачу, отправляем ему ответ чата

    await bot.sendMessage(msg.chat.id, chatResponse)

    return false
  }
}
