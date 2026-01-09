import { MediaType } from './MediaType';

export class HttpHeaders {
    // Using a map to store headers. implementing a subset of Spring's HttpHeaders
    private headers: Map<string, string[]>;

    constructor(headers?: Record<string, string | string[]>) {
        this.headers = new Map();
        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    this.add(key, value);
                } else if (Array.isArray(value)) {
                    this.headers.set(key.toLowerCase(), value);
                }
            });
        }
    }

    public add(headerName: string, headerValue: string): void {
        const key = headerName.toLowerCase();
        const currentValues = this.headers.get(key) || [];
        currentValues.push(headerValue);
        this.headers.set(key, currentValues);
    }

    public set(headerName: string, headerValue: string): void {
        this.headers.set(headerName.toLowerCase(), [headerValue]);
    }

    public get(headerName: string): string[] | undefined {
        return this.headers.get(headerName.toLowerCase());
    }

    public getFirst(headerName: string): string | null {
        const values = this.get(headerName);
        return values && values.length > 0 ? values[0] : null;
    }

    public setContentType(mediaType: MediaType | string): void {
        this.set('Content-Type', mediaType.toString());
    }

    public getContentType(): MediaType | null {
        const value = this.getFirst('Content-Type');
        return value ? MediaType.parseMediaType(value) : null;
    }

    public getPragma(): string | null {
        return this.getFirst('Pragma');
    }

    public setPragma(pragma: string): void {
        this.set('Pragma', pragma);
    }

    public setAcceptCharset(charsets: string | string[]): void {
        if (typeof charsets === 'string') {
            this.set('Accept-Charset', charsets);
        } else {
            // In Java it's a list of Charsets. Here we take strings.
            // If array, join with comma
            this.set('Accept-Charset', charsets.join(', '));
        }
    }

    public toObject(): Record<string, string | string[]> {
        const obj: Record<string, string | string[]> = {};
        for (const [key, values] of this.headers.entries()) {
            if (values.length === 1) {
                obj[key] = values[0];
            } else {
                obj[key] = values;
            }
        }
        return obj;
    }

    public static from(headers: Record<string, any>): HttpHeaders {
        const httpHeaders = new HttpHeaders();
        for (const [key, value] of Object.entries(headers)) {
            if (typeof value === 'string') {
                httpHeaders.add(key, value);
            } else if (typeof value === 'number' || typeof value === 'boolean') {
                httpHeaders.add(key, String(value));
            } else if (Array.isArray(value)) {
                value.forEach(v => httpHeaders.add(key, String(v)));
            }
        }
        return httpHeaders;
    }
}
