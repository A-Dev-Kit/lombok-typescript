import 'reflect-metadata';
import {
  ChainOfResponsibility,
  Command,
  CommandHistory,
  Handler,
  Iterable,
  IterateOver,
  Memento,
  Observable,
  State,
  Strategy,
  StrategyRegistry,
  Transition,
} from 'lombok-typescript/legacy';
import { toObservable } from 'lombok-typescript/observers/rxjs';

interface Compressor {
  compress(data: string): string;
}

@Strategy('compression', 'gzip')
class GzipCompressor implements Compressor {
  compress(data: string) {
    return `gzip:${data}`;
  }
}

@Strategy('compression', 'none')
class NoCompressor implements Compressor {
  compress(data: string) {
    return data;
  }
}

@State({ states: ['draft', 'done'], initial: 'draft' })
class Task {
  @Transition({ from: 'draft', to: 'done' })
  complete() {
    return 'ok';
  }
}

@Command
class AppendText {
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
class Editor {
  content = '';
}

@Observable
class Counter {
  count = 0;
}

@ChainOfResponsibility
class Auth {
  @Handler({ order: 1 })
  checkToken(req: { token?: string }) {
    return Boolean(req.token);
  }
}

@Iterable
class Playlist {
  @IterateOver
  songs: string[] = ['a', 'b'];
}

console.info('strategies', StrategyRegistry.list('compression'));
const compressor = StrategyRegistry.get<Compressor>('compression', 'gzip');
console.info('strategy', compressor.compress('data'));
void GzipCompressor;
void NoCompressor;

const task = new Task();
task.complete();
console.info('state', task.state);

const doc = { text: '' };
const history = new CommandHistory();
history.execute(new AppendText(doc, 'Hi'));
history.undo();
console.info('command', doc.text);

const editor = new Editor();
editor.content = 'save me';
const snap = editor.save();
editor.content = 'lost';
editor.restore(snap);
console.info('memento', editor.content);

const counter = new Counter();
toObservable<number>(counter, 'count').subscribe((n) => console.info('rxjs count', n));
counter.count = 1;

const auth = new Auth();
console.info('chain handled', auth.handle({ token: 'x' }));

console.info('iterable', [...new Playlist()]);
