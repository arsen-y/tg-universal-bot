import { bot, db, openaiAPI } from '../index.js'
import { AbstractMiddleware } from '../classes/AbstractMiddleware.js'
import { User } from '../classes/User.js'

export class Level5 extends AbstractMiddleware {
  override async handle(msg: any, user: User) {
    if (!(await super.handle(msg, user))) return false

    console.log('level 5')

    if (!user.levelInitialized) {
      user.levelInitialized = true
      await db.update('UPDATE users SET level_initialized=? WHERE id=?', [1, user.userId])

      await bot.sendMessage(
        msg.chat.id,
        `У вас пятый уровень в чате. Вы можете писать произвольные сообщения чату GPT.`,
      )

      return false
    }

    if (msg.text.length < 3 || msg.text.length > 100) {
      await bot.sendMessage(
        msg.chat.id,
        `Некорректная длина сообщения. Длина должна быть от 3 до 100 символов. Сейчас длина вашего сообщения составляет ${msg.text.length} символов.`,
      )
      return false
    }

    user.chatContext.push({
      role: 'user',
      content: msg.text,
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

    return true
  }
}
