import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export class User {
  public constructor(
    public userId: number,
    public level: number,
    public levelInitialized: boolean,
    public countMsgSended: number,
    public chatContext: ChatCompletionMessageParam[],
  ) {}
}
