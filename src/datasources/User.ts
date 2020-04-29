import isEmail from 'isemail';
import uuidv4 from 'uuid/v4';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { MSBStore, UserModel } from '../utils';

export interface UserAPIArguments {
  store: MSBStore
}

class UserAPI extends DataSource {
  store: MSBStore;
  context: any;

  constructor({ store }: UserAPIArguments) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config: DataSourceConfig<any>) {
    this.context = config.context;
  }

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  async findOrCreateUser({ email: emailArg }: {email?: string} = {}) {
    const email =
      this.context && this.context.user ? this.context.user.email : emailArg;
    if (!email || !isEmail.validate(email)) return null;

    const users = await this.store.users.findOrCreate({ where: { email } });
    return users && users[0] ? users[0] : null;
  }

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  async findOne(fields: Partial<UserModel> = {}): Promise<any> {
    const query =
      this.context && this.context.user ? { id: this.context.user.id } : { email: fields.email! };
    console.log('fields', fields);
    console.log('query', query)
    return await this.store.users.findOne({ where: { email: fields.email! } });
  }

  async getUsers(): Promise<UserModel[]> {
    return await this.store.users.findAll();
  }

  async addUser(user: UserModel) {
    await this.store.users.create(user);
  }
}
    
export default UserAPI;
