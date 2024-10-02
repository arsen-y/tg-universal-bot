import { User } from '../classes/User.js'

export interface IMiddleware {
  handle(msg: any, user: User): Promise<boolean>
}
