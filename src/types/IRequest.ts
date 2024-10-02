import { IMiddleware } from './IMiddleware.js'

export interface IRequest {
  middlewares: IMiddleware[]
  use(middleware: IMiddleware): void
  run(...args: Parameters<IMiddleware['handle']>): void
}
