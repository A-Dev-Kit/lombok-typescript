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
console.log('singleton same', service === new UserService());
console.log('memoized', service.loadUser('1') === service.loadUser('1'));

export { UserService };
