import { User } from '../classes/User.js'

export interface ILevelsQuestController {
  defaultAction(msg: any, user: User): void
}
