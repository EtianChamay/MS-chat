import { NextFunction, Request, Response } from "express";

import UsersService from "#root/adapters/UsersService";

const injectSession = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.userSessionId;
  if (sessionId) {
    const userSession = await UsersService.fetchUserSession({ sessionId });

    if (userSession) {
      res.locals.userSession = userSession;
    } else {
      console.log(`WARN: sessionId cookie is missing = ${sessionId}`);
    }
  }

  return next();
};

export default injectSession;
