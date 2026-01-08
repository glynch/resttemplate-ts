import { HttpEntity } from './HttpEntity';
import { HttpHeaders } from './HttpHeaders';

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503
    // Add more as needed
}

export class ResponseEntity<T> extends HttpEntity<T> {
    private readonly status: number;
    private readonly statusText: string;

    constructor(body: T | null, headers: HttpHeaders, status: number, statusText: string = '') {
        super(body, headers);
        this.status = status;
        this.statusText = statusText;
    }

    public getStatusCode(): number {
        return this.status;
    }

    public getStatusCodeValue(): number {
        return this.status;
    }

    public getStatusText(): string {
        return this.statusText;
    }

    // Static builders could be added here similar to Spring
    public static ok<T>(body?: T): ResponseEntity<T> {
        return new ResponseEntity(body || null, new HttpHeaders(), HttpStatus.OK, 'OK');
    }
}
