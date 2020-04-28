import passport, { AuthenticateOptions } from 'passport';
import express from 'express';

export interface IVerifyOptions {
    info: boolean;
    message?: string;
  }
  
  export interface AuthenticateReturn<UserObjectType extends {}> {
    user: UserObjectType | undefined;
    info: IVerifyOptions | undefined;
  }

export const promisifiedAuthentication = <UserObjectType extends {}>(
    req: express.Request,
    res: express.Response,
    name: string,
    options: AuthenticateOptions,
  ) => {
    const p = new Promise<AuthenticateReturn<UserObjectType>>((resolve, reject) => {
      const done = (err: Error | undefined, user: UserObjectType | undefined, info?: IVerifyOptions | undefined) => {
          console.log('auth done', { user, info })
        if (err) reject(err);
        else resolve({ user, info });
      };
  
      const authFn = passport.authenticate(name, options, done);
      console.log('call passport with:', name)
      return authFn(req, res);
    });
  
    return p;
  };
  
 export const promisifiedLogin = <UserObjectType extends {}>(
    req: express.Request,
    user: UserObjectType,
    options?: AuthenticateOptions,
  ) =>
    new Promise<void>((resolve, reject) => {
      const done = (err: Error | undefined) => {
        if (err) reject(err);
        else resolve();
      };
  
      req.login(user, options, done);
    });