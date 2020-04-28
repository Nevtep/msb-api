export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const users: User[] = [
    {
      id: '1',
      firstName: 'Maurice',
      lastName: 'Moss',
      email: 'maurice@moss.com',
      password: 'abcdefg'
    },
    {
      id: '2',
      firstName: 'Roy',
      lastName: 'Trenneman',
      email: 'roy@trenneman.com',
      password: 'imroy'
    }
  ];
  
  export default {
    findOne: (query: Partial<User>, cb: (err: Error | null, user?: User) => void) => cb(null, users.find(user => user.id == query.id)),
    getUsers: () => users,
    addUser: (user: User) => users.push(user),
  };