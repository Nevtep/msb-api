import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { MSBStore, PlanModel } from './models';
import { WhereAttributeHash } from 'sequelize/types';

export interface PlanAPIArguments {
  store: MSBStore
}

export interface PlanModelQuery extends Partial<PlanModel> {
  [index: string]: any;
}

class PlanAPI extends DataSource {
  store: MSBStore;
  context: any;

  constructor({ store }: PlanAPIArguments) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the plan making requests
   */
  initialize(config: DataSourceConfig<any>) {
    this.context = config.context;
  }

  /**
   * Plan can be called with an argument that includes email, but it doesn't
   * have to be. If the plan is already on the context, it will use that plan
   * instead
   */
  async findOne(fields: PlanModelQuery = {}): Promise<PlanModel | null> {
    let query: WhereAttributeHash = {};
    for(let key of Object.keys(fields)) {
      query[key] = fields[key];
    }
    
    return await this.store.Plan.findOne({ where: { ...query } });
  }

  async getPlans(): Promise<PlanModel[]> {
    return await this.store.Plan.findAll();
  }

  async addPlan(plan: Partial<PlanModel>) {
    return await this.store.Plan.create(plan);
  }

  async setPlan(plan: Partial<PlanModel>) {
    return await this.store.Plan.upsert(plan);
  }

  async removePlan(id: string) {
    return await this.store.Plan.destroy({ where: { id }});
  }
}
    
export default PlanAPI;
