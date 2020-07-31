import isEmail from 'isemail';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { MSBStore, ServiceModel } from './models';
import { WhereAttributeHash } from 'sequelize/types';

export interface ServiceAPIArguments {
  store: MSBStore
}

export interface ServiceModelQuery extends Partial<ServiceModel> {
  [index: string]: any;
}

class ServiceAPI extends DataSource {
  store: MSBStore;
  context: any;

  constructor({ store }: ServiceAPIArguments) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the service making requests
   */
  initialize(config: DataSourceConfig<any>) {
    this.context = config.context;
  }

  /**
   * Service can be called with an argument that includes email, but it doesn't
   * have to be. If the service is already on the context, it will use that service
   * instead
   */
  async findOne(fields: ServiceModelQuery = {}): Promise<any> {
    let query: WhereAttributeHash = {};
    for(let key in fields) {
      query[key] = fields[key];
    }

    return await this.store.Service.findOne({ where: { ...query } });
  }

  async getServices(userId: string): Promise<ServiceModel[]> {
    return await this.store.Service.findAll({ where: { userId }});
  }

  async addService(service: Partial<ServiceModel>) {
    return await this.store.Service.create(service);
  }

  async setService(service: Partial<ServiceModel>) {
    return await this.store.Service.upsert(service);
  }

  async removeService(id: string) {
    return await this.store.Service.destroy({ where: { id }});
  }
}
    
export default ServiceAPI;
