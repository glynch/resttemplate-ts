import { MediaType } from '../http/MediaType';
import { HttpHeaders } from '../http/HttpHeaders';

export interface HttpMessageConverter<T> {
    canRead(clazz: any, mediaType?: MediaType): boolean;
    canWrite(clazz: any, mediaType?: MediaType): boolean;
    getSupportedMediaTypes(): MediaType[];
    read(clazz: any, inputMessage: any): T; // inputMessage would range from raw string to stream
    write(t: T, contentType?: MediaType, outputHeaders?: HttpHeaders): any; // returns body to send; can modify headers
}
