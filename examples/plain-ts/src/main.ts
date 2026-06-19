import 'reflect-metadata';
import { CommandHistory, Memoize, Singleton, StrategyRegistry } from 'lombok-typescript/legacy';
import { toObservable } from 'lombok-typescript/observers/rxjs';
import { Point } from './point.js';
import { applyAllGenerated } from '../.lombok/src/point.lombok.js';
import {
  AppendText,
  Auth,
  Counter,
  Editor,
  Playlist,
  Task,
  type Compressor,
} from './behavioral.js';

applyAllGenerated({ Point });

@Singleton
class UserService {
  @Memoize()
  loadUser(id: string) {
    return { id, name: `User-${id}` };
  }
}

const service = new UserService();
const point = new Point();
point.x = 1;
point.y = 2;
const moved = point.withX(10);
console.info('point withX', moved.x, moved.y);
console.info('singleton same', service === new UserService());
console.info('memoized', service.loadUser('1') === service.loadUser('1'));

const compressor = StrategyRegistry.get<Compressor>('compression', 'gzip');
console.info('strategy', compressor.compress('data'));
console.info('strategies', StrategyRegistry.list('compression'));

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

export { UserService };
