import { User } from '../classes/User.js'
import { bot } from '../index.js'

export default class AboutController {
  public async defaultAction(msg: any, user: User): Promise<void> {
    const commands = `
/start - Запуск бота
/about - Общая информацию про бота
/about author - Про автора бота
/about ai - Про AI технологии, применяемые в данном боте.
`
    await bot.sendMessage(
      msg.chat.id,
      `Данный бот является тестовым демонстрационным проектом Арсения Соколовского. Пройдя все уровни, вы сможете отправлять произвольные сообщения чату GPT с сохранением контекста диалога в базе данных. Поддерживаемые команды:\n${commands}`,
    )
  }

  public async author(msg: any, user: User): Promise<void> {
    await bot.sendMessage(
      msg.chat.id,
      `Арсений Соколовский пишет в основном на JavaScript и PHP, связаться с ним можно по TG @yodajackson`,
    )
  }

  public async aiAction(msg: any, user: User): Promise<void> {
    await bot.sendMessage(msg.chat.id, `В данном боте применяется Chat GPT api, модель gpt-4o-mini.`)
  }
}
