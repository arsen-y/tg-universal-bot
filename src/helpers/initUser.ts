import { db } from '../index.js'
import { User } from '../classes/User.js'

export async function initUser(id: number): Promise<User> {
  try {
    const row = await db.getrow('SELECT * from users WHERE id=?', [id])
    console.log(row)

    if (row !== undefined && 'level' in row) {
      let chatContext = []
      if (row.chat_context.length > 1) {
        chatContext = await JSON.parse(row.chat_context)
      }

      return new User(id, row.level, Boolean(row.level_initialized), row.count_msg_sended, chatContext)
    } else {
      // new user
      await db.insert('INSERT INTO users SET id=?, level=1, level_initialized=0, count_msg_sended=0, chat_context=""', [
        id,
      ])

      return new User(id, 1, false, 0, [])
    }
  } catch (err) {
    console.log(err)
  }
}
