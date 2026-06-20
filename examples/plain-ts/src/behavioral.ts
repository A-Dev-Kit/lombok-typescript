import 'reflect-metadata';
import {
  ChainOfResponsibility,
  Command,
  Handler,
  Iterable,
  IterateOver,
  Memento,
  Observable,
  State,
  Strategy,
  Transition,
} from '@a-dev-kit/lombok-typescript/legacy';

interface Compressor {
  compress(data: string): string;
}

@Strategy('compression', 'gzip')
export class GzipCompressor implements Compressor {
  compress(data: string) {
    return `gzip:${data}`;
  }
}

@Strategy('compression', 'none')
export class NoCompressor implements Compressor {
  compress(data: string) {
    return data;
  }
}

@State({ states: ['draft', 'done'], initial: 'draft' })
export class Task {
  @Transition({ from: 'draft', to: 'done' })
  complete() {
    return 'ok';
  }
}

@Command
export class AppendText {
  constructor(
    private readonly target: { text: string },
    private readonly chunk: string,
  ) {}

  execute() {
    this.target.text += this.chunk;
  }

  undo() {
    this.target.text = this.target.text.slice(0, -this.chunk.length);
  }
}

@Memento
export class Editor {
  content = '';
}

@Observable
export class Counter {
  count = 0;
}

@ChainOfResponsibility
export class Auth {
  @Handler({ order: 1 })
  checkToken(req: { token?: string }) {
    return Boolean(req.token);
  }
}

@Iterable
export class Playlist {
  @IterateOver
  songs: string[] = ['a', 'b'];
}

export type { Compressor };
