import { HttpHeaders } from '../http/HttpHeaders';

export interface HttpMessageConverter<T> {
    canRead(clazz: any, mediaType?: string): boolean;
    canWrite(clazz: any, mediaType?: string): boolean;
    getSupportedMediaTypes(): string[];
    read(clazz: any, inputMessage: any): T; // inputMessage would range from raw string to stream
    write(t: T, contentType?: string): any; // returns body to send
}
