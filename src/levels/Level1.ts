import { bot, db } from '../index.js'
import { AbstractMiddleware } from '../classes/AbstractMiddleware.js'
import { User } from '../classes/User.js'

export class Level1 extends AbstractMiddleware {
  override async handle(msg: any, user: User) {
    if (!(await super.handle(msg, user))) return false

    if (user.level > 1) {
      return true
    }

    if (!user.levelInitialized) {
      user.levelInitialized = true
      await db.update('UPDATE users SET level_initialized=? WHERE id=?', [1, user.userId])

      bot.sendSticker(msg.chat.id, 'https://tlgrm.ru/_/stickers/103/ec9/103ec963-babe-310e-a90e-951b969835a4/1.webp')
      await bot.sendMessage(
        msg.chat.id,
        `Добро пожаловать в Universal TG AI Bot. У вас первый level. Чтобы повысить level, ответьте, в каком году был основан биткоин? Ответ дайте цифрами.`,
      )
    }

    if (/^\d+$/.test(msg.text)) {
      if (msg.text == 2009) {
        await bot.sendMessage(msg.chat.id, `Вы дали верный ответ. Повышаем ваш level в чате до второго.`)
        user.level = 2
        user.levelInitialized = false
        await db.update('UPDATE users SET level=?, level_initialized=0 WHERE id=?', [2, user.userId])

        return true
      } else {
        await bot.sendMessage(msg.chat.id, `К сожалению, вы дали неверный ответ. Попробуйте ещё раз.`)
      }

      return false
    } else if (msg.text.length > 0) {
      await bot.sendMessage(msg.chat.id, `В ответе должны быть только цифры`)
    }

    return false
  }
}
