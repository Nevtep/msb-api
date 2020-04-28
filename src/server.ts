import express from 'express';
import session from 'express-session';
import { v4 as uuid } from 'uuid';
import passport, { AuthenticateOptions } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { GraphQLLocalStrategy, buildContext } from 'graphql-passport';
import UserAPI, { User } from './datasources/User';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import schema from './schema';

passport.use(
  new GraphQLLocalStrategy((email: unknown, password: unknown, done: (error: Error | null, user?: User) => void) => {
    const users = UserAPI.getUsers();
    const matchingUser = users.find(user => email === user.email && password === user.password);
    const error = matchingUser ? null : new Error('no matching user');
    done(error, matchingUser);
  })
);

passport.use(new LocalStrategy(
    function(email, password, done) {
      UserAPI.findOne({ email }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!(user.password == password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

passport.serializeUser((user: User, done) => {
    done(null, user.id);
});
  
passport.deserializeUser((id, done) => {
    const users = UserAPI.getUsers();
    const matchingUser = users.find(user => user.id === id);
    done(null, matchingUser);
});

  
const app = express();
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  context: ({ req, res }) => buildContext({ req, res, UserAPI }),
});
app.use('*', cors());
app.use(compression());
app.use(session({
    genid: () => uuid(),
    secret: process.env.SESSION_SECRET!,
    cookie: process.env.NODE_ENV == 'production' ? { secure: true } : undefined,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

server.applyMiddleware({ app, path: '/graphql' });
const httpServer = createServer(app);
httpServer.listen(
  { port: 3000 },
  (): void => console.log(`\n🚀      GraphQL is now running on http://localhost:3000/graphql`));