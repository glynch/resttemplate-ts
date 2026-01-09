import { HttpMessageConverter } from './HttpMessageConverter';
import { MediaType } from '../http/MediaType';
import { HttpHeaders } from '../http/HttpHeaders';

export class StringHttpMessageConverter implements HttpMessageConverter<string> {

    public static readonly DEFAULT_CHARSET = 'ISO-8859-1';

    private readonly defaultCharset: string;
    private readonly availableCharsets: string[];
    private writeAcceptCharset: boolean = true;

    constructor(defaultCharset: string = StringHttpMessageConverter.DEFAULT_CHARSET) {
        this.defaultCharset = defaultCharset;
        // In a real environment we would check available charsets. Here we list common ones.
        this.availableCharsets = ['ISO-8859-1', 'UTF-8', 'US-ASCII'];
    }

    public setWriteAcceptCharset(writeAcceptCharset: boolean): void {
        this.writeAcceptCharset = writeAcceptCharset;
    }

    public canRead(clazz: any, mediaType?: MediaType): boolean {
        if (clazz !== String) return false;
        if (!mediaType) return true;
        for (const supported of this.getSupportedMediaTypes()) {
            if (supported.includes(mediaType)) {
                return true;
            }
        }
        return false;
    }

    public canWrite(clazz: any, mediaType?: MediaType): boolean {
        if (clazz !== String) return false;
        if (!mediaType) return true;
        for (const supported of this.getSupportedMediaTypes()) {
            if (supported.includes(mediaType)) {
                return true;
            }
        }
        return false;
    }

    public getSupportedMediaTypes(): MediaType[] {
        return [MediaType.TEXT_PLAIN, MediaType.ALL];
    }

    public read(clazz: any, inputMessage: any): string {
        if (typeof inputMessage === 'string') {
            return inputMessage;
        }
        return String(inputMessage);
    }

    public write(t: string, contentType?: MediaType, outputHeaders?: HttpHeaders): any {
        if (this.writeAcceptCharset && outputHeaders) {
            outputHeaders.setAcceptCharset(this.availableCharsets);
        }
        // Ideally we would handle charset encoding here if we had robust Stream/Buffer support and requirement.
        // For now, returning the string relies on Axios/environment default encoding (usually UTF-8).
        return t;
    }
}
