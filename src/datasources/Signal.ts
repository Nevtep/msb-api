import isEmail from 'isemail';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { MSBStore, SignalModel } from './models';
import { Op } from './models';
import { isVIP } from '../schema/authorization';
import { WhereAttributeHash } from 'sequelize/types/lib/model';

export interface SignalAPIArguments {
  store: MSBStore
}

export interface SignalModelQuery extends Partial<SignalModel> {
  [index: string]: any;
}

class SignalAPI extends DataSource {
  store: MSBStore;
  context: any;

  constructor({ store }: SignalAPIArguments) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the signal making requests
   */
  initialize(config: DataSourceConfig<any>) {
    this.context = config.context;
  }

  /**
   * Signal can be called with an argument that includes email, but it doesn't
   * have to be. If the signal is already on the context, it will use that signal
   * instead
   */
  async findOrCreateSignal({ email: emailArg }: {email?: string} = {}) {
    const email =
      this.context && this.context.signal ? this.context.signal.email : emailArg;
    if (!email || !isEmail.validate(email)) return null;

    const signals = await this.store.Signal.findOrCreate({ where: { email } });
    return signals && signals[0] ? signals[0] : null;
  }

  /**
   * Signal can be called with an argument that includes email, but it doesn't
   * have to be. If the signal is already on the context, it will use that signal
   * instead
   */
  async findOne(fields: SignalModelQuery = {}): Promise<any> {
    let query: WhereAttributeHash = {};
    for(let key of Object.keys(fields)) {
      query[key] = fields[key];
    }

    return this.store.Signal.findOne({ where: { ...query } });
  }

  /**
   * Signal can be called with an argument that includes email, but it doesn't
   * have to be. If the signal is already on the context, it will use that signal
   * instead
   */
  async find(fields: SignalModelQuery = {}): Promise<SignalModel[]> {
    let query: WhereAttributeHash = {};
    for(let key of Object.keys(fields)) {
      query[key] = fields[key];
    }

    return this.store.Signal.findAll({ where: { ...query } });
  }

  async getSignals(): Promise<SignalModel[]> {
    if(isVIP(this.context.getUser())) {
      const date = new Date();
      const MS_IN_A_MIN = 60000
      const MS_IN_A_HOUR = 60 * MS_IN_A_MIN;
      const MS_IN_A_DAY = 24 * MS_IN_A_HOUR;
      date.setMinutes(0);
      date.setHours(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      const today = date.getTime();
      const vipSignals = {
        where: {
              [Op.and]: [{ time: { [Op.gt]: today }}, { time: { [Op.lt]: today + MS_IN_A_DAY }}]
            }
      }
      console.log('return vip signals')
      return this.store.Signal.findAll(vipSignals);
    } else {
      console.log('return all signals')
      return this.store.Signal.findAll();
    }
  }

  async addSignal(signal: Partial<SignalModel>) {
    return this.store.Signal.create(signal);
  }

  async removeSignal(id: string) {
    return this.store.Signal.destroy({ where: { id }});
  }
}
    
export default SignalAPI;
