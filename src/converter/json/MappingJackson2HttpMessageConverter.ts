import { HttpMessageConverter } from '../HttpMessageConverter';
import { ObjectMapper } from 'jackson-js';
import moment from 'moment';
import { MediaType } from '../../http/MediaType';
import { HttpHeaders } from '../../http/HttpHeaders';

export class MappingJackson2HttpMessageConverter implements HttpMessageConverter<any> {
    private objectMapper: ObjectMapper;

    constructor(objectMapper?: ObjectMapper) {
        this.objectMapper = objectMapper || new ObjectMapper();
    }

    public canRead(clazz: any, mediaType?: MediaType): boolean {
        if (!mediaType) return true;
        for (const supported of this.getSupportedMediaTypes()) {
            if (supported.isCompatibleWith(mediaType)) {
                return true;
            }
        }
        return false;
    }

    public canWrite(clazz: any, mediaType?: MediaType): boolean {
        if (!mediaType) return true;
        for (const supported of this.getSupportedMediaTypes()) {
            if (supported.isCompatibleWith(mediaType)) {
                return true;
            }
        }
        return false;
    }

    public getSupportedMediaTypes(): MediaType[] {
        return [MediaType.APPLICATION_JSON, new MediaType("application", "*+json")];
    }

    public read(clazz: any, inputMessage: any): any {
        const context = {
            mainCreator: () => [clazz] as [any],
            dateLibrary: moment
        };

        if (typeof inputMessage === 'string') {
            return this.objectMapper.parse(inputMessage, context);
        }
        return this.objectMapper.parse(JSON.stringify(inputMessage), context);
    }

    public write(t: any, contentType?: MediaType, outputHeaders?: HttpHeaders): any {
        const context = {
            dateLibrary: moment
        };
        return this.objectMapper.stringify(t, context);
    }
}
