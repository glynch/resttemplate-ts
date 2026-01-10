import { MediaType } from './MediaType';

export class HttpHeaders {
    public static readonly ACCEPT = "Accept";
    public static readonly ACCEPT_CHARSET = "Accept-Charset";
    public static readonly ACCEPT_ENCODING = "Accept-Encoding";
    public static readonly ACCEPT_LANGUAGE = "Accept-Language";
    public static readonly ACCEPT_RANGES = "Accept-Ranges";
    public static readonly ACCESS_CONTROL_ALLOW_CREDENTIALS = "Access-Control-Allow-Credentials";
    public static readonly ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
    public static readonly ACCESS_CONTROL_ALLOW_METHODS = "Access-Control-Allow-Methods";
    public static readonly ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
    public static readonly ACCESS_CONTROL_EXPOSE_HEADERS = "Access-Control-Expose-Headers";
    public static readonly ACCESS_CONTROL_MAX_AGE = "Access-Control-Max-Age";
    public static readonly ACCESS_CONTROL_REQUEST_HEADERS = "Access-Control-Request-Headers";
    public static readonly ACCESS_CONTROL_REQUEST_METHOD = "Access-Control-Request-Method";
    public static readonly AGE = "Age";
    public static readonly ALLOW = "Allow";
    public static readonly AUTHORIZATION = "Authorization";
    public static readonly CACHE_CONTROL = "Cache-Control";
    public static readonly CONNECTION = "Connection";
    public static readonly CONTENT_ENCODING = "Content-Encoding";
    public static readonly CONTENT_DISPOSITION = "Content-Disposition";
    public static readonly CONTENT_LANGUAGE = "Content-Language";
    public static readonly CONTENT_LENGTH = "Content-Length";
    public static readonly CONTENT_LOCATION = "Content-Location";
    public static readonly CONTENT_RANGE = "Content-Range";
    public static readonly CONTENT_TYPE = "Content-Type";
    public static readonly COOKIE = "Cookie";
    public static readonly DATE = "Date";
    public static readonly ETAG = "ETag";
    public static readonly EXPECT = "Expect";
    public static readonly EXPIRES = "Expires";
    public static readonly FROM = "From";
    public static readonly HOST = "Host";
    public static readonly IF_MATCH = "If-Match";
    public static readonly IF_MODIFIED_SINCE = "If-Modified-Since";
    public static readonly IF_NONE_MATCH = "If-None-Match";
    public static readonly IF_RANGE = "If-Range";
    public static readonly IF_UNMODIFIED_SINCE = "If-Unmodified-Since";
    public static readonly LAST_MODIFIED = "Last-Modified";
    public static readonly LINK = "Link";
    public static readonly LOCATION = "Location";
    public static readonly MAX_FORWARDS = "Max-Forwards";
    public static readonly ORIGIN = "Origin";
    public static readonly PRAGMA = "Pragma";
    public static readonly PROXY_AUTHENTICATE = "Proxy-Authenticate";
    public static readonly PROXY_AUTHORIZATION = "Proxy-Authorization";
    public static readonly RANGE = "Range";
    public static readonly REFERER = "Referer";
    public static readonly RETRY_AFTER = "Retry-After";
    public static readonly SERVER = "Server";
    public static readonly SET_COOKIE = "Set-Cookie";
    public static readonly SET_COOKIE2 = "Set-Cookie2";
    public static readonly TE = "TE";
    public static readonly TRAILER = "Trailer";
    public static readonly TRANSFER_ENCODING = "Transfer-Encoding";
    public static readonly UPGRADE = "Upgrade";
    public static readonly USER_AGENT = "User-Agent";
    public static readonly VARY = "Vary";
    public static readonly VIA = "Via";
    public static readonly WARNING = "Warning";
    public static readonly WWW_AUTHENTICATE = "WWW-Authenticate";

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
        this.set(HttpHeaders.CONTENT_TYPE, mediaType.toString());
    }

    public getContentType(): MediaType | null {
        const value = this.getFirst(HttpHeaders.CONTENT_TYPE);
        return value ? MediaType.parseMediaType(value) : null;
    }

    public getPragma(): string | null {
        return this.getFirst(HttpHeaders.PRAGMA);
    }

    public setPragma(pragma: string): void {
        this.set(HttpHeaders.PRAGMA, pragma);
    }

    public setAcceptCharset(charsets: string | string[]): void {
        if (typeof charsets === 'string') {
            this.set(HttpHeaders.ACCEPT_CHARSET, charsets);
        } else {
            // In Java it's a list of Charsets. Here we take strings.
            // If array, join with comma
            this.set(HttpHeaders.ACCEPT_CHARSET, charsets.join(', '));
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
