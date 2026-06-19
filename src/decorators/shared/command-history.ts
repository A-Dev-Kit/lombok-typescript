import type { CommandInstance } from './command.js';

export class CommandHistory {
  private readonly undoStack: CommandInstance[] = [];
  private readonly redoStack: CommandInstance[] = [];

  execute(cmd: CommandInstance): unknown {
    const result = cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack.length = 0;
    return result;
  }

  undo(): unknown {
    const cmd = this.undoStack.pop();
    if (!cmd) {
      throw new Error('Nothing to undo');
    }
    if (typeof cmd.undo !== 'function') {
      this.undoStack.push(cmd);
      throw new Error('Command does not support undo()');
    }
    const result = cmd.undo();
    this.redoStack.push(cmd);
    return result;
  }

  redo(): unknown {
    const cmd = this.redoStack.pop();
    if (!cmd) {
      throw new Error('Nothing to redo');
    }
    const result = cmd.execute();
    this.undoStack.push(cmd);
    return result;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
