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
    readonly subscriptions?: Array<ServiceModel>;
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type UserModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): UserModel;
}

export interface PlanModel extends Model {
    readonly id: number;
    readonly updatedAt?: Date;
    readonly createdAt?: Date;
    readonly label: string;
    readonly duration: Array<string | number>;
    readonly amount: number;
    readonly role: string;
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type PlanModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): PlanModel;
}

// We need to declare an interface for our model that is basically what our class would be
export interface SignalModel extends Model {
    readonly id: number;
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
    readonly id: number;
    readonly name: string;
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type RoleModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): RoleModel;
}


// We need to declare an interface for our model that is basically what our class would be
export interface ServiceModel extends Model {
    readonly id: number,
    readonly name: string,
    readonly startDate: Date,
    readonly endDate: Date,
    readonly RoleId: string,
    readonly UserId: string,
    readonly paymentRef: string,
}
  
// Need to declare the static model so `findOne` etc. use correct types.
export type ServiceModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): ServiceModel;
}

export type MSBStore = {
    Sequelize: typeof SequelizeType;
    sequelize: SequelizeType;
    Op: typeof OpType;
    User: UserModelStatic;
    Signal: SignalModelStatic;
    Role: RoleModelStatic;
    Service: ServiceModelStatic;
    Plan: PlanModelStatic
}

declare const Sequelize: typeof SequelizeType;
declare const sequelize: SequelizeType;
declare const Op: typeof OpType;
declare const User: UserModelStatic;
declare const Signal: SignalModelStatic;
declare const Role: RoleModelStatic;
declare const Service: ServiceModelStatic;
declare const Plan: PlanModelStatic;
