import { Sequelize as SequelizeType, Model, BuildOptions } from 'sequelize';

// We need to declare an interface for our model that is basically what our class would be
export interface UserModel extends Model {
    readonly id: string;
    readonly updatedAt: Date;
    readonly createdAt: Date;
    readonly email: string;
    readonly fullName: string;
    readonly password: string;
    readonly verified: boolean;
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type UserModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): UserModel;
}

export type MSBStore = {
    Sequelize: typeof SequelizeType;
    sequelize: SequelizeType;
    User: UserModelStatic;
}

declare const Sequelize: typeof SequelizeType;
declare const sequelize: SequelizeType;
declare const User: UserModelStatic;