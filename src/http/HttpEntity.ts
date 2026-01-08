import { HttpHeaders } from './HttpHeaders';

export class HttpEntity<T> {
    private readonly headers: HttpHeaders;
    private readonly body: T | null;

    constructor(body?: T | null, headers?: HttpHeaders | null) {
        this.body = body ?? null;
        this.headers = headers ?? new HttpHeaders();
    }

    public getHeaders(): HttpHeaders {
        return this.headers;
    }

    public getBody(): T | null {
        return this.body;
    }

    public hasBody(): boolean {
        return this.body !== null;
    }
}
