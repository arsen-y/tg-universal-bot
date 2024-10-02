import { User } from '../classes/User.js'
import { UserRequest } from '../classes/UserRequest.js'
import { Level1 } from '../levels/Level1.js'
import { Level2 } from '../levels/Level2.js'
import { Level3 } from '../levels/Level3.js'
import { Level4 } from '../levels/Level4.js'
import { Level5 } from '../levels/Level5.js'
import { ILevelsQuestController } from '../types/ILevelsQuestController.js'

export default class LevelsQuestController implements ILevelsQuestController {
  public defaultAction(msg: any, user: User): void {
    const UserRQ = new UserRequest()

    UserRQ.use(new Level1())
    UserRQ.use(new Level2())
    UserRQ.use(new Level3())
    UserRQ.use(new Level4())
    UserRQ.use(new Level5())

    UserRQ.run(msg, user)
  }
}
