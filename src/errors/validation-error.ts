import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "./custom-api-error";

export class ValidationError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
  }
}