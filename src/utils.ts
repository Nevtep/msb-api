import { Sequelize, DATE, INTEGER, STRING, Model, BuildOptions } from 'sequelize';

// We need to declare an interface for our model that is basically what our class would be
export interface UserModel extends Model {
  readonly id: number;
  readonly email: string;
  readonly fullName: string;
  readonly password: string;
}

// Need to declare the static model so `findOne` etc. use correct types.
export type UserModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): UserModel;
}

export type MSBStore = {
  db: Sequelize,
  users: UserModelStatic,
  subscriptions: typeof Model,
}

export const createStore = () => {
  const db = new Sequelize(process.env.DATABASE_URL!, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // <<<<<<< YOU NEED THIS
      }
    },
  })

  const users = <UserModelStatic>db.define('user', {
    createdAt: DATE,
    updatedAt: DATE,
    email: STRING,
    fullName: STRING,
    password: STRING,
  });

  const subscriptions = db.define('subscription', {
    createdAt: DATE,
    updatedAt: DATE,
    launchId: INTEGER,
    userId: INTEGER,
  });

  return { db, users, subscriptions };
};
