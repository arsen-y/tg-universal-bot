import { IMiddleware } from '../types/IMiddleware.js'
import { IRequest } from '../types/IRequest.js'
import { User } from './User.js'

export class UserRequest implements IRequest {
  middlewares: IMiddleware[] = []
  middlewareIndex: number = 0

  use(middleware: IMiddleware): void {
    this.middlewares.push(middleware)
  }

  async run(msg: any, user: User): Promise<void> {
    for (let i = 0; i < this.middlewares.length; i++) {
      if (!(await this.middlewares[i].handle(msg, user))) {
        return
      }
    }
  }
}
