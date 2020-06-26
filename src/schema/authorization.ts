import { UserModel } from "../datasources/models";

export const isAdmin = (user: UserModel) => user.email === 'santiago.vottero@autocity.com.ar';

export const isVIP = (user: UserModel) => true