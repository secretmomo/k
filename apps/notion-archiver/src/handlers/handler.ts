export abstract class Handler {
  abstract isMatch(text: string): boolean;

  abstract process(message_id: string, text: string): Promise<void>;
}
