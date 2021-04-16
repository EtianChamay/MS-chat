import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import express from "express";

import resolvers from "#root/graphql/resolvers";
import schema from "#root/graphql/schema";

import formatGraphQLError from "./formatGraphQLError";
import injectSession from "./middleware/injectSession";

const PORT = <number>config.get("PORT");

const startServer = () => {
  const apolloServer = new ApolloServer({
    context: (a) => a,
    formatError: formatGraphQLError,
    resolvers,
    typeDefs: schema,
  });

  const app = express();

  app.use(cookieParser());

  app.use(
    cors({
      credentials: true,
      origin: (origin, cb) => cb(null, true),
    })
  );

  app.use(injectSession);

  apolloServer.applyMiddleware({ app, cors: false, path: "/graphql" });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API-gateway listening on ${PORT}`);
  });
};

export default startServer;
