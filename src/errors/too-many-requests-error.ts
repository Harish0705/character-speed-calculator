import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "./custom-api-error";

export class TooManyRequestsError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.TOO_MANY_REQUESTS;
  }
}