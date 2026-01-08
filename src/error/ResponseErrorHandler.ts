import { ResponseEntity } from '../http/ResponseEntity';

export interface ResponseErrorHandler {
    hasError(response: ResponseEntity<any>): Promise<boolean>;
    handleError(response: ResponseEntity<any>): Promise<void>;
}
