import { db, openaiAPI } from '../index.js'
import { User } from '../classes/User.js'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export async function sendAIReq(history: ChatCompletionMessageParam[], user: User): Promise<string> {
  const response = await openaiAPI.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: history,
  })

  let chatResponse = response.choices[0].message.content

  history.push({ role: 'assistant', content: chatResponse })

  await db.update('UPDATE users SET count_msg_sended=count_msg_sended+1, chat_context=? WHERE id=?', [
    JSON.stringify(history, null, 2),
    user.userId,
  ])

  return chatResponse
}
