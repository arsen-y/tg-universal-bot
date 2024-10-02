export default class ExampleController {
  public defaultAction(...args: any[]): void {
    console.log('Default action called with args:', args)
  }

  public customAction(...args: any[]): void {
    console.log('Custom action called with args:', args)
  }
}
