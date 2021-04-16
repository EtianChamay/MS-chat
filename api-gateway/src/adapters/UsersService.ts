import config from "config";
import got from "got";

const USERS_SERVICE_URI = <string>config.get("USERS_SERVICE_URI");

export interface User {
  createdAt: string;
  id: string;
  username: string;
}

export interface UserSession {
  createdAt: string;
  expireAt: string;
  id: string;
  user: string;
}

export interface BasicCredentials {
  password: string;
  username: string;
}

export default class UsersService {
  static async createUser({ password, username }: BasicCredentials): Promise<User | null> {
    const body = <User>(
      await got.post(`${USERS_SERVICE_URI}/users`, { json: { password, username } }).json()
    );
    return body;
  }

  static async createUserSession({
    password,
    username,
  }: BasicCredentials): Promise<UserSession | null> {
    const body = <UserSession>(
      await got.post(`${USERS_SERVICE_URI}/sessions`, { json: { password, username } }).json()
    );
    return body;
  }

  static async deleteUserSession({ sessionId }: { sessionId: string }) {
    const body = await got.delete(`${USERS_SERVICE_URI}/sessions/${sessionId}`).json();
    return body;
  }

  static async fetchUser({ userId }: { userId: string }): Promise<User | null> {
    const body = <User>await got.get(`${USERS_SERVICE_URI}/users/${userId}`).json();
    if (!body) return null;
    return body;
  }

  static async fetchUserSession({ sessionId }: { sessionId: string }): Promise<UserSession | null> {
    try {
      const body = <UserSession>await got.get(`${USERS_SERVICE_URI}/sessions/${sessionId}`).json();
      if (!body) return null;
      return body;
    } catch (error) {
      console.log(`received error from users service ${error.message}`);
      return null;
    }
  }
}
