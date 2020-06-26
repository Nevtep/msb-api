import { Sequelize as SequelizeType, Model, BuildOptions, Op as OpType} from 'sequelize';
import { OperationTypeDefinitionNode } from 'graphql';

// We need to declare an interface for our model that is basically what our class would be
export interface UserModel extends Model {
    readonly id: string;
    readonly facebookId?: string;
    readonly updatedAt?: Date;
    readonly createdAt?: Date;
    readonly email: string;
    readonly fullName: string;
    readonly password?: string;
    readonly verified?: boolean;
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type UserModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): UserModel;
}

// We need to declare an interface for our model that is basically what our class would be
export interface SignalModel extends Model {
    readonly id: string;
    readonly time: Date;
    readonly pair: string;
    readonly op: string;
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type SignalModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): SignalModel;
}

// We need to declare an interface for our model that is basically what our class would be
export interface RoleModel extends Model {
    readonly id: string;
    readonly name: string;
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type RoleModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): RoleModel;
}

export type MSBStore = {
    Sequelize: typeof SequelizeType;
    sequelize: SequelizeType;
    Op: typeof OpType;
    User: UserModelStatic;
    Signal: SignalModelStatic;
    Role: RoleModelStatic;
}

declare const Sequelize: typeof SequelizeType;
declare const sequelize: SequelizeType;
declare const Op: typeof OpType;
declare const User: UserModelStatic;
declare const Signal: SignalModelStatic;
declare const Role: RoleModelStatic;