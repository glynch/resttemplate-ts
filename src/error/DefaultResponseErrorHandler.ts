import { ResponseErrorHandler } from './ResponseErrorHandler';
import { HttpStatus, ResponseEntity } from '../http/ResponseEntity';
import { ObjectMapper } from 'jackson-js';
import { AuthenticatedRestError } from './AuthenticatedRestError';
import { AuthenticatedRestClientResponseException } from './AuthenticatedRestClientResponseException';

export class DefaultResponseErrorHandler implements ResponseErrorHandler {
    private objectMapper: ObjectMapper;

    constructor() {
        this.objectMapper = new ObjectMapper();
    }

    public async hasError(response: ResponseEntity<any>): Promise<boolean> {
        const status = response.getStatusCode();
        return (
            status === HttpStatus.BAD_REQUEST ||
            status === HttpStatus.UNAUTHORIZED ||
            status === HttpStatus.FORBIDDEN ||
            status === HttpStatus.NOT_FOUND ||
            status === HttpStatus.METHOD_NOT_ALLOWED ||
            status === HttpStatus.INTERNAL_SERVER_ERROR ||
            status === HttpStatus.NOT_IMPLEMENTED ||
            status === HttpStatus.BAD_GATEWAY ||
            status === HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public async handleError(response: ResponseEntity<any>): Promise<void> {
        const body = response.getBody();
        const status = response.getStatusCode();
        const statusText = response.getStatusText();

        try {
            // Attempt to parse as AuthenticatedRestError
            let error: AuthenticatedRestError;
            if (typeof body === 'string') {
                error = this.objectMapper.parse<AuthenticatedRestError>(body, { mainCreator: () => [AuthenticatedRestError] });
            } else {
                error = this.objectMapper.parse<AuthenticatedRestError>(JSON.stringify(body), { mainCreator: () => [AuthenticatedRestError] });
            }

            // Check if parsing actually resulted in a meaningful object (jackson-js might succeed with empty fields)
            // Assuming AuthenticatedRestError has some fields populated or we accept partial
            if (error) {
                throw new AuthenticatedRestClientResponseException(error, status, statusText, body);
            }
        } catch (e) {
            if (e instanceof AuthenticatedRestClientResponseException) {
                throw e;
            }
            // If parsing fails or any other error, validation from user request:
            // "if that fails then just throw and Error instead of a RestClientException"
            throw new Error(`Request failed with status value: ${status} ${statusText}, body: ${JSON.stringify(body)}`);
        }
    }
}
