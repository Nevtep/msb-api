import isEmail from 'isemail';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { MSBStore, UserModel } from './models';
import { WhereAttributeHash } from 'sequelize/types';

export interface UserAPIArguments {
  store: MSBStore
}

export interface UserModelQuery extends Partial<UserModel> {
  [index: string]: any;
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

    const users = await this.store.User.findOrCreate({ where: { email } });
    return users && users[0] ? users[0] : null;
  }

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  async findOne(fields: UserModelQuery = {}): Promise<any> {
    let query: WhereAttributeHash = {};
    for(let key of Object.keys(fields)) {
      query[key] = fields[key];
    }

    return await this.store.User.findOne({ where: { ...query } });
  }

  async getUsers(): Promise<UserModel[]> {
    return await this.store.User.findAll();
  }

  async addUser(user: Partial<UserModel>) {
    await this.store.User.create(user);
  }
}
    
export default UserAPI;
