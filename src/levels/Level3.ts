import { bot, db, openaiAPI } from '../index.js'
import { AbstractMiddleware } from '../classes/AbstractMiddleware.js'
import { User } from '../classes/User.js'

export class Level3 extends AbstractMiddleware {
  override async handle(msg: any, user: User) {
    if (!(await super.handle(msg, user))) return false

    console.log('level 3')

    if (user.level > 3) {
      return true
    }

    if (!user.levelInitialized) {
      user.levelInitialized = true
      await db.update('UPDATE users SET level_initialized=? WHERE id=?', [1, user.userId])

      await bot.sendMessage(
        msg.chat.id,
        `У вас третий уровень в чате. Для повышения уровня вам необходимо правильно ответить на вопрос по истории от чата GPT.`,
      )

      user.chatContext.push({
        role: 'user',
        content:
          'Загадай мне интересный вопрос на знание мировой истории. Ответ должен быть в пределах двух слов. Если я отвечу правильно, напиши просто "yes", если неправильно, направь меня, дай подсказки.',
      })

      const response = await openaiAPI.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: user.chatContext,
      })

      let chatResponse = response.choices[0].message.content

      user.chatContext.push({ role: 'assistant', content: chatResponse })

      await db.update('UPDATE users SET count_msg_sended=count_msg_sended+1, chat_context=? WHERE id=?', [
        JSON.stringify(user.chatContext, null, 2),
        user.userId,
      ])

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

    const response = await openaiAPI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: user.chatContext,
    })

    let chatResponse = response.choices[0].message.content

    user.chatContext.push({ role: 'assistant', content: chatResponse })

    await db.update('UPDATE users SET count_msg_sended=count_msg_sended+1, chat_context=? WHERE id=?', [
      JSON.stringify(user.chatContext, null, 2),
      user.userId,
    ])

    if (/yes/i.test(chatResponse)) {
      // пользователь решил загадку

      await bot.sendMessage(msg.chat.id, `Вы дали верный ответ. Повышаем ваш level в чате до четвертого.`)
      user.level = 4
      user.levelInitialized = false
      await db.update('UPDATE users SET level=?, level_initialized=0 WHERE id=?', [4, user.userId])

      return true
    }

    // пользователь не решил задачу, отправляем ему ответ чата

    await bot.sendMessage(msg.chat.id, chatResponse)

    return false
  }
}
