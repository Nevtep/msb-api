import isEmail from 'isemail';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { MSBStore, RoleModel } from './models';
import { WhereAttributeHash } from 'sequelize/types';

export interface RoleAPIArguments {
  store: MSBStore
}

export interface RoleModelQuery extends Partial<RoleModel> {
  [index: string]: any;
}

class RoleAPI extends DataSource {
  store: MSBStore;
  context: any;

  constructor({ store }: RoleAPIArguments) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the role making requests
   */
  initialize(config: DataSourceConfig<any>) {
    this.context = config.context;
  }

  /**
   * Role can be called with an argument that includes email, but it doesn't
   * have to be. If the role is already on the context, it will use that role
   * instead
   */
  async findOrCreateRole({ name }: {name: string}) {
    const roles = await this.store.Role.findOrCreate({ where: { name } });
    return roles && roles[0] ? roles[0] : null;
  }

  /**
   * Role can be called with an argument that includes email, but it doesn't
   * have to be. If the role is already on the context, it will use that role
   * instead
   */
  async findOne(fields: RoleModelQuery = {}): Promise<any> {
    let query: WhereAttributeHash = {};
    for(let key of Object.keys(fields)) {
      query[key] = fields[key];
    }

    return await this.store.Role.findOne({ where: { ...query } });
  }

  async getRoles(): Promise<RoleModel[]> {
    return await this.store.Role.findAll();
  }

  async addRole(role: Partial<RoleModel>) {
    return await this.store.Role.create(role);
  }

  async removeRole(id: string) {
    return await this.store.Role.destroy({ where: { id }});
  }
}
    
export default RoleAPI;
