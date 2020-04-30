import express from 'express';
import session from 'express-session';
import { v4 as uuid } from 'uuid';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { GraphQLLocalStrategy, buildContext } from 'graphql-passport';
import UserAPI from './datasources/User';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import compression from 'compression';
import cors from 'cors';
import bcrypt from 'bcrypt';
import schema from './schema';
import store, { UserModel } from './datasources/models';

const getDataSources = () => ({
  usersAPI: new UserAPI({ store }),
});

passport.use(
  new GraphQLLocalStrategy((email: unknown, password: unknown, done: (error: Error | null, user?: any) => void) => {
    getDataSources().usersAPI.findOne({ email: email as string }).then((user) => {
      if(!user) {
        return done(new Error('no matching user'))
      }
      bcrypt.compare(password, user.dataValues.password, (err, match) => {
        if(err) {
          return done(err);
        }
        if(match) {
          return done(null, user);
        } else {
          return done(null, false)
        }
      })
    });
  })
);

passport.use(new LocalStrategy(
    function(email, password, done) {
      getDataSources().usersAPI.findOne({ email: email as string }).then((user) => {
        if(!user) {
          return done(new Error('no matching user'))
        }
        bcrypt.compare(password, user.password, (err, match) => {
          if(err) {
            return done(err);
          }
          if(match) {
            return done(null, user);
          } else {
            return done(null, false)
          }
        })
      });
    }
  ));

passport.serializeUser((user: UserModel, done) => {
    done(null, user.email);
});
  
passport.deserializeUser((email, done) => {
  getDataSources().usersAPI.findOne({ email: email as string }).then(user => {
    done(null, user);
  });
});

const app = express();
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  dataSources: getDataSources,
  context: ({ req, res }) => buildContext({ req, res }),
});
const corsOptions = {
  origin: '*',
  credentials: true,
};
app.options('*', cors())
app.use(cors({
  origin: '*',
  credentials: true,
  preflightContinue: true
}));
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

app.listen(
  { port: process.env.PORT },
  (): void => console.log(`\n🚀      GraphQL is now running on http://localhost:${process.env.PORT}/graphql`));