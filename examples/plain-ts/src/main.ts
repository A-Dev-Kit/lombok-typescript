import 'reflect-metadata';
import {
  CommandHistory,
  Memoize,
  Singleton,
  StrategyRegistry,
} from '@a-dev-kit/lombok-typescript/legacy';
import { toObservable } from '@a-dev-kit/lombok-typescript/observers/rxjs';
import { Point } from './point.js';
import { applyAllGenerated as applyPointGenerated } from '../.lombok/src/point.lombok.js';
import {
  AppendText,
  Auth,
  Counter,
  Editor,
  Playlist,
  Task,
  type Compressor,
} from './behavioral.js';
import {
  AreaVisitor,
  Circle,
  Coffee,
  DataExporter,
  FileNode,
  Service,
  Square,
  TreeType,
  WithMilk,
} from './structural.js';
import { applyAllGenerated as applyStructuralGenerated } from '../.lombok/src/structural.lombok.js';
import { demoPhase5Utilities, Profile, SignupDto } from './utilities.js';
import { applyAllGenerated as applyUtilitiesGenerated } from '../.lombok/src/utilities.lombok.js';
import { describeMarkers } from './markers.js';

applyStructuralGenerated({
  DataExporter,
  Circle,
  Square,
});

applyPointGenerated({ Point });
applyUtilitiesGenerated({ SignupDto, Profile });

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

const treeA = new TreeType('green');
const treeB = new TreeType('green');
console.info('flyweight same', treeA === treeB);

const root = new FileNode();
const leaf = new FileNode();
root.add(leaf);
console.info('composite children', root.getChildren().length);

console.info('proxy work', new Service().work());
const WithMilkCtor = WithMilk as unknown as new (inner: Coffee) => WithMilk;
console.info('wraps cost', new WithMilkCtor(new Coffee()).cost());

const exporter = new DataExporter();
exporter.export();
console.info('template export', exporter.log.join(','));

const circle = new Circle();
const square = new Square();
const visitor = new AreaVisitor();
console.info('visitor circle', circle.accept(visitor));
console.info('visitor square', square.accept(visitor));

const phase5 = await demoPhase5Utilities();
console.info('phase5 status', phase5.status, phase5.signupEmail, phase5.frozen);
console.info('phase6 markers', describeMarkers());

export { UserService };
