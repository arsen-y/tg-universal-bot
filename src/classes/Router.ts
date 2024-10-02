import { IRoutes } from '../types/IRoutes.js'

export class Router {
  private routes: IRoutes

  constructor(routes: IRoutes) {
    this.routes = routes
  }

  public async route(request: string, ...args: any[]): Promise<void> {
    request = request.trim().replace(/\s+/g, '/')

    const [path, methodName] = request.split('/').filter(Boolean)
    const controllerName = this.routes[path]

    console.log(`request ${request}`)

    if (!controllerName) {
      throw new Error(`Route not found for path: ${path}`)
    }

    const formattedMethodName = methodName
      ? methodName.charAt(0).toLowerCase() + methodName.slice(1) + 'Action'
      : 'defaultAction'

    try {
      // Динамически импортируем контроллер без изменения его имени

      const { default: ControllerClass } = await import(`../controllers/${controllerName}.js`)
      const controllerInstance = new ControllerClass()

      try {
        const method = controllerInstance[formattedMethodName]

        if (typeof method === 'function') {
          method.apply(controllerInstance, args)
        } else {
          throw new Error(
            `Method not found (it should have ending "Action"): ${formattedMethodName} in ${controllerName}`,
          )
        }
      } catch (error) {
        throw new Error(
          `Method not found (it should have ending "Action"): ${formattedMethodName} in ${controllerName}`,
        )
      }
    } catch (error) {
      if (error.message.includes('Method not found')) {
        throw new Error(error.message)
      }

      throw new Error(`Controller not found: ${controllerName}`)
    }
  }
}
