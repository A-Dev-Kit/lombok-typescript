import 'reflect-metadata';
import { Memoize, Singleton } from 'lombok-typescript/legacy';
import { Point } from './point.js';
import { applyAllGenerated } from '../.lombok/src/point.lombok.js';

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

export { UserService };
