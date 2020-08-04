import express from 'express';
import session from 'express-session';
import { v4 as uuid } from 'uuid';
import passport from 'passport';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { Strategy as LocalStrategy } from 'passport-local';
import { GraphQLLocalStrategy, buildContext } from 'graphql-passport';
import UserAPI from './datasources/User';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import bcrypt from 'bcrypt';
import schema from './schema';
import store, { UserModel } from './datasources/models';
import { Strategy as FacebookStrategy, StrategyOption as FacebookStrategyOption, VerifyFunction as FacebookVerifyFunction } from 'passport-facebook';
import redis from 'redis';
import connectRedis from 'connect-redis';
import SignalAPI from './datasources/Signal';
import RoleAPI from './datasources/Role';


const { PORT } = process.env;

const redisStore = connectRedis(session);
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
})
const getDataSources = () => ({
  usersAPI: new UserAPI({ store }),
  signalsAPI: new SignalAPI({ store }),
  rolesAPI: new RoleAPI({ store }),
});

passport.use(
  new GraphQLLocalStrategy((email: unknown, password: unknown, done: (error: Error | null, user?: any) => void) => {
    getDataSources().usersAPI.findOne({ email: email as string }).then((user) => {
      if(!user) {
        return done(new Error('Usuario o password no válidos'))
      }
      bcrypt.compare(password, user.dataValues.password, (err, match) => {
        if(err) {
          console.log('error: %o', err);
          return done(err);
        }
        if(match) {
          return done(null, user);
        } else {
          return done(new Error('Usuario o password no válidos'), false)
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

  const facebookOptions: FacebookStrategyOption = {
    clientID: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
    profileFields: ['id', 'email', 'first_name', 'last_name'],
  };

  const facebookCallback: FacebookVerifyFunction = (accessToken, refreshToken, profile, done) => {
    const { usersAPI } = getDataSources();
    usersAPI.findOne({ email: profile.emails && profile.emails[0] && profile.emails[0].value as string }).then((user) => {
      if(!user) {
        const newUser = {
          id: uuid(),
          facebookId: profile.id,
          fullName: `${profile?.name?.givenName} ${profile?.name?.familyName}`,
          email: profile.emails && profile.emails[0] && profile.emails[0].value || '',
        };
        usersAPI.addUser(newUser);
        done(null, newUser);
      } else {
        // update user with fb id
      }
      done(null, user);
      return;
    });
  };

  passport.use(new FacebookStrategy(
    facebookOptions,
    facebookCallback,
  ));
  

passport.serializeUser((user: UserModel, done) => {
  console.log('user:', user)
    done(null, user.email);
});
  
passport.deserializeUser((email, done) => {
  console.log('email', email)
  getDataSources().usersAPI.findOne({ email: email as string }).then(user => {
    user.lo
    done(null, user);
  });
});

const app = express();
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  dataSources: getDataSources,
  context: ({ req, res, connection }) => buildContext({ req, res, connection }),
});
const corsOptions: CorsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(session({
  store: new redisStore({
    client: redisClient
  }),
    genid: () => uuid(),
    secret: process.env.SESSION_SECRET!,
    cookie: process.env.NODE_ENV == 'production' ? {
      domain: 'api.maximasenalesbinarias.com',
      sameSite: 'none',
      secure: true
    } : undefined,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.options('/graphql', cors(corsOptions))
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: `${process.env.STATIC_APP_URL!}/app`,
  failureRedirect: `${process.env.STATIC_APP_URL!}/login`,
}));

server.applyMiddleware({ app, path: '/graphql', cors: false });

if (process.env.NODE_ENV == 'production') {
  const options = {
    key: fs.readFileSync(__dirname + "/_ssl/privkey.pem"),
    cert: fs.readFileSync(__dirname + "/_ssl/fullchain.pem")
  };
  
  const httpsServer = https.createServer(options, app);
  server.installSubscriptionHandlers(httpsServer);
  
  httpsServer.listen( PORT, (): void => {
    console.log(`🚀 Server ready at https://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at wss://localhost:${PORT}${server.subscriptionsPath}`)
  });
} else {
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen( PORT, (): void => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
  });
}
