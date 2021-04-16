import { Request, Response } from "express";

import { UserSession } from "#root/adapters/UsersService";

export interface ResolverContext {
  req: Request;
  res: Response;
}

export interface UserSessionType extends UserSession {
  createdAt: string;
  expireAt: string;
  id: string;
  userId: string;
}
