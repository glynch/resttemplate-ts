import { ResponseErrorHandler } from './ResponseErrorHandler';
import { ResponseEntity, HttpStatus } from '../http/ResponseEntity';

export class DefaultResponseErrorHandler implements ResponseErrorHandler {
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
        const status = response.getStatusCode();
        const statusText = response.getStatusText();
        const body = response.getBody();
        throw new Error(`Request failed with status value: ${status} ${statusText}, body: ${JSON.stringify(body)}`);
    }
}
