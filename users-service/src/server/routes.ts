import config from "config";
import dayjs from "dayjs";
import { Express } from "express";
import omit from "lodash.omit";
import { getConnection, getRepository } from "typeorm";

import User from "#root/db/entities/User";
import UserSession from "#root/db/entities/UserSessions";
import generateUUID from "#root/helpers/generateUUID";
import hashPassword from "#root/helpers/hashPassword";
import passwordCompareSync from "#root/helpers/passwordCompareSync";
import generateClientError from "#root/helpers/generateClientError";

const USER_SESSION_EXPIRY_HOURS = <number>config.get("USER_SESSION_EXPIRY_HOURS");

const setupRoutes = (app: Express) => {
  const connection = getConnection();
  const userRepository = getRepository(User);
  const userSessionRepository = getRepository(UserSession);

  app.post("/sessions", async (req, res, next) => {
    const { username, password } = req?.body;

    if (!username || !password) {
      return next(new Error("Invalid body!"));
    }

    try {
      const user = await userRepository.findOne({ username }, { select: ["id", "passwordHash"] });

      if (!user) {
        return next(new Error("Invalid username!"));
      }

      if (!passwordCompareSync(password, user.passwordHash)) {
        return next(new Error("Invalid password!"));
      }

      const expireAt = dayjs().add(USER_SESSION_EXPIRY_HOURS, "hour").toISOString();

      const sessionToken = generateUUID();

      const userSession = {
        expireAt,
        id: sessionToken,
        userId: user.id,
      };

      await connection
        .createQueryBuilder()
        .insert()
        .into(UserSession)
        .values([userSession])
        .execute();

      return res.json(userSession);
    } catch (error) {
      return next(error);
    }
  });

  app.delete("/sessions/:sessionId", async (req, res, next) => {
    try {
      const userSession = await userSessionRepository.findOne(req.params.sessionId);

      if (!userSession) return next(generateClientError(res, "Invalid session ID", 404));

      await userSessionRepository.remove(userSession);

      return res.end();
    } catch (error) {
      return next(error);
    }
  });

  app.get("/sessions/:sessionId", async (req, res, next) => {
    try {
      const userSession = await userSessionRepository.findOne(req.params.sessionId);

      if (!userSession) return next(generateClientError(res, "Invalid session ID", 404));

      return res.json(userSession);
    } catch (error) {
      return next(error);
    }
  });

  app.post("/users", async (req, res, next) => {
    const { username, password } = <{ username: string; password: string }>req?.body ?? {};

    if (!username || !password) {
      return next(new Error("Invalid body"));
    }

    try {
      const newUser = {
        id: generateUUID(),
        passwordHash: hashPassword(password),
        username,
      };

      await connection.createQueryBuilder().insert().into(User).values([newUser]).execute();

      return res.json(omit(newUser, ["passwordHash"]));
    } catch (error) {
      return next(error);
    }
  });

  app.get("/users/:userId", async (req, res, next) => {
    try {
      const user = await userRepository.findOne(req.params.userId);

      if (!user) return next(new Error("Invalid user ID"));

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  });
};

export default setupRoutes;
