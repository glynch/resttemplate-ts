import { AuthenticatedRestError } from './AuthenticatedRestError';

export class AuthenticatedRestClientResponseException extends Error {
    public readonly error: AuthenticatedRestError;
    public readonly statusCode: number;
    public readonly statusText: string;
    public readonly responseBody: any;

    constructor(error: AuthenticatedRestError, statusCode: number, statusText: string, responseBody: any) {
        super(`Authenticated request failed: ${error.getMessage()} (Code: ${error.getErrorCode()})`);
        this.error = error;
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.responseBody = responseBody;
        Object.setPrototypeOf(this, AuthenticatedRestClientResponseException.prototype);
    }
}
