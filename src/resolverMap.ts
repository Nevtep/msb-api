// resolverMap.ts
import { IResolvers } from 'graphql-tools';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

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
    signup: async (parent, { fullName, email, password }, context) => {
        const existingUsers = await context.dataSources.usersAPI.getUsers();
        const userWithEmailAlreadyExists = !!existingUsers.find((user: any) => user.dataValues.email === email);
  
        if (userWithEmailAlreadyExists) {
          throw new Error('Ya existe un usuario con ese Email registrado.');
        }
  
        const newUser = {
          id: uuid(),
          fullName,
          email,
          password: await bcrypt.hash(password, 10),
        };
        context.dataSources.usersAPI.addUser(newUser);
  
        await context.login(newUser);
  
        return { user: newUser };
    },
  },
};
export default resolverMap;