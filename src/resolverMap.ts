// resolverMap.ts
import { IResolvers } from 'graphql-tools';
import { v4 as uuid } from 'uuid';
import { User } from './datasources/User';

const resolverMap: IResolvers = {
  Query: {
    helloWorld(_: void, args: void): string {
  return `👋 Hello world! 👋`;
    },
    currentUser: (parent, args, context) => context.getUser(),
  },
  Mutation: {
    logout: (parent, args, context) => context.logout(),
    login: async (parent, { email, password }, context) => {
        const { user } = await context.authenticate('graphql-local', { email, password });
        await context.login(user);
        return { user }
    },
    signup: async (parent, { firstName, lastName, email, password }, context) => {
        const existingUsers: User[] = context.UserAPI.getUsers();
        const userWithEmailAlreadyExists = !!existingUsers.find(user => user.email === email);
  
        if (userWithEmailAlreadyExists) {
          throw new Error('User with email already exists');
        }
  
        const newUser = {
          id: uuid(),
          firstName,
          lastName,
          email,
          password,
        };
  
        context.UserAPI.addUser(newUser);
  
        await context.login(newUser);
  
        return { user: newUser };
    },
  },
};
export default resolverMap;