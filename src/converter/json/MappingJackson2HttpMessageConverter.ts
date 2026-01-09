import { HttpMessageConverter } from '../HttpMessageConverter';
import { ObjectMapper } from 'jackson-js';
import moment from 'moment';

export class MappingJackson2HttpMessageConverter implements HttpMessageConverter<any> {
    private objectMapper: ObjectMapper;

    constructor(objectMapper?: ObjectMapper) {
        this.objectMapper = objectMapper || new ObjectMapper();
    }

    public canRead(clazz: any, mediaType?: string): boolean {
         if (!mediaType) return false;
        return this.getSupportedMediaTypes().includes(mediaType);
    }

    public canWrite(clazz: any, mediaType?: string): boolean {
         if (!mediaType) return false;
        return this.getSupportedMediaTypes().includes(mediaType);
    }

    public getSupportedMediaTypes(): string[] {
        return ['application/json', 'application/*+json'];
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

    public write(t: any, contentType?: string): any {
        const context = {
            dateLibrary: moment
        };
        return this.objectMapper.stringify(t, context);
    }
}
