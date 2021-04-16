import UsersService from "#root/adapters/UsersService";
import { ResolverContext } from "#root/graphql/types";

interface Args {
  password: string;
  username: string;
}

const createUserSessionResolver = async (
  obj: any,
  { password, username }: Args,
  context: ResolverContext
) => {
  const userSession = await UsersService.createUserSession({ password, username });

  if (!userSession?.id ?? false) throw new Error("failed to create user session");

  context.res.cookie("userSessionId", userSession.id, { httpOnly: true });

  return userSession;
};

export default createUserSessionResolver;
