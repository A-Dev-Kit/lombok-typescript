import 'reflect-metadata';
import { Memoize, Singleton } from 'lombok-typescript/legacy';

@Singleton
class UserService {
  @Memoize()
  loadUser(id: string) {
    return { id, name: `User-${id}` };
  }
}

const service = new UserService();
console.info('singleton same', service === new UserService());
console.info('memoized', service.loadUser('1') === service.loadUser('1'));

export { UserService };
