import { bot } from '../index.js'
import { IMiddleware } from '../types/IMiddleware.js'
import { User } from './User.js'

export abstract class AbstractMiddleware implements IMiddleware {
  async handle(msg: any, user: User): Promise<boolean> {
    console.log('new handle')

    if (user.countMsgSended >= 50) {
      await bot.sendMessage(
        msg.chat.id,
        `Вы достигли глобального лимита в 50 запросов к GPT чату. Обратитесь к администратору чата для обнуления счетчика.`,
      )
      return false
    }

    return true
  }
}
