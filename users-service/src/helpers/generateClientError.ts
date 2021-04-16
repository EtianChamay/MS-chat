import { Response } from "express";

const generateClientError = (response: Response, message: string, clientErrorCode = 400) => {
  response.status(clientErrorCode);
  return new Error(message);
};

export default generateClientError;
