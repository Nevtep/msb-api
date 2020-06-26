// resolverMap.ts
import { IResolvers } from 'graphql-tools';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import csv from 'csv-parser';
import { PubSub } from 'apollo-server';
import SignalAPI from '../datasources/Signal';
import store, { Op } from '../datasources/models';
import TimestampType from './GraphQLTimestamp';
import { isAdmin } from './authorization';
import { FileUpload } from 'graphql-upload';
import DateType from './GraphQLDate';

const VIP_SIGNAL = 'VIP_SIGNAL';
const VIP_MESSAGE = 'VIP_MESSAGE';
const MS_IN_A_MIN = 60000
const pubsub = new PubSub();
const signalsAPI = new SignalAPI({ store });

const resolverMap: IResolvers = {
  Date: DateType,
  Timestamp: TimestampType,
  Subscription: {
    vipSignal: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([VIP_SIGNAL]),
    },
    vipMessage: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([VIP_MESSAGE]),
    },
  },
  Query: {
    currentUser: (_parent, _args, context) => context.getUser(),
    signals: async (_parent, _args, context) => {
      if(context.isUnauthenticated()) {
        throw new Error('Only authorized users')
      }
      const {dataSources} = context;
      const user = context.getUser();
      if(isAdmin(user)) {
        return await dataSources.signalsAPI.getSignals();
      } else {
        throw new Error('DO NOT FUCK WITH US')
      }
    },
    users: async (parent, args, context) => {
      if(context.isUnauthenticated()) {
        throw new Error('Only authorized users')
      }
      const {dataSources} = context;
      const user = context.getUser();
      if(isAdmin(user)) {
        return await dataSources.usersAPI.getUsers();
      } else {
        throw new Error('DO NOT FUCK WITH US')
      }
    }, 
    roles: async (parent, args, context) => {
      if(context.isUnauthenticated()) {
        throw new Error('Only authorized users')
      }
      const {dataSources} = context;
      const user = context.getUser();
      if(isAdmin(user)) {
        return await dataSources.rolesAPI.getRoles();
      } else {
        throw new Error('DO NOT FUCK WITH US')
      }
    }, 
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
    addRole: async (parent, role, context) => {
      const { dataSources } = context;
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to add signals')
      }
      // rate limit with a queue
      const user = context.getUser();
      if(isAdmin(user)) {
        return dataSources.rolesAPI.addRole(role);
      } else {
        throw new Error('DO NOT FUCK WITH US')
      }
    },
    removeRole: async (parent, role, context) => {
      const { dataSources } = context;
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to remove signals')
      }
      // rate limit with a queue
      const user = context.getUser();
      if(isAdmin(user)) {
        return await dataSources.rolesAPI.removeRole(role.id);
      } else {
        throw new Error('DO NOT FUCK WITH US')
      }
    },
    setUser: async (parent, { user }, context) => {
      const { dataSources } = context;
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to add signals')
      }
      // rate limit with a queue
      const authenticatedUser = context.getUser();
      console.log('user', authenticatedUser)
      if(isAdmin(authenticatedUser)) {
        const values = {
          id: uuid(),
          ...user,
        }
        await dataSources.usersAPI.setUser(values);
        
        return values;
      } else {
        throw new Error('DO NOT FUCK WITH US');
      }
    },
    deleteUser: async (parent, { id }, context) => {
      const { dataSources } = context;
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to remove signals')
      }
      // rate limit with a queue
      const authenticatedUser = context.getUser();
      if(isAdmin(authenticatedUser)) {
        return await dataSources.usersAPI.removeUser(id);
      } else {
        throw new Error('DO NOT FUCK WITH US');
      }
    },
    addSignal: async (parent, signal, context) => {
      const { dataSources } = context;
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to add signals')
      }
      // rate limit with a queue
      const user = context.getUser();
      if(isAdmin(user)) {
        const time = new Date(signal.time);
        const { pair, op } = signal;
        return dataSources.signalsAPI.addSignal({
          time,
          pair,
          op
        });
      } else {
        throw new Error('DO NOT FUCK WITH US')
      }
    },
    removeSignal: async (parent, role, context) => {
      const { dataSources } = context;
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to remove signals')
      }
      // rate limit with a queue
      const user = context.getUser();
      if(isAdmin(user)) {
        return dataSources.signalsAPI.removeSignal(role.id);
      } else {
        throw new Error('DO NOT FUCK WITH US')
      }
    },
    uploadSignals: (_parent, args, context) => {const { dataSources } = context;
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to add signals')
      }
      // rate limit with a queue
      const user = context.getUser();
      if(isAdmin(user)) {
        return args.file.then((file: FileUpload) => {
          //Contents of Upload scalar: https://github.com/jaydenseric/graphql-upload#class-graphqlupload
          const results: string[] = [];
          file.createReadStream() // is a readable node stream that contains the contents of the uploaded file
            .pipe(csv())
            .on('data', (signal) => {
              const time = new Date(signal.time);
              const { pair, op } = signal;
              results.push(dataSources.signalsAPI.addSignal({
                time,
                pair,
                op
              }));
            })
            .on('end', () => {
              console.log(results);
              return results;
            }); 
          //node stream api: https://nodejs.org/api/stream.html
        });
      } else {
        throw new Error('DO NOT FUCK WITH US');
      }
    },
    sendMessage: async (parent, message, context) => {
      console.log(context.getUser());
      if(context.isUnauthenticated()) {
        throw new Error('You need to login to send messages')
      }
      // rate limit with a queue
      const user = context.getUser();
      pubsub.publish(VIP_MESSAGE, { vipMessage: { user, ...message }});

    },
  },
};

setInterval(async () => {
  const now = Date.now();
  const signals = await signalsAPI.find({
    [Op.and]: [{ time: { [Op.gt]: now - MS_IN_A_MIN * 15}}, { time: { [Op.lt]: now + MS_IN_A_MIN * 15}}]
  });
  for(let vipSignal of signals) {
    pubsub.publish(VIP_SIGNAL, { vipSignal });
  };
}, MS_IN_A_MIN * 5)

export default resolverMap;