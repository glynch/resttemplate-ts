import { HttpMessageConverter } from '../HttpMessageConverter';
import { ObjectMapper } from 'jackson-js';

export class MappingJackson2HttpMessageConverter implements HttpMessageConverter<any> {
    private objectMapper: ObjectMapper;

    constructor(objectMapper?: ObjectMapper) {
        this.objectMapper = objectMapper || new ObjectMapper();
    }

    public canRead(clazz: any, mediaType?: string): boolean {
        return true; // Simplified for now
    }

    public canWrite(clazz: any, mediaType?: string): boolean {
        return true; // Simplified for now
    }

    public getSupportedMediaTypes(): string[] {
        return ['application/json', 'application/*+json'];
    }

    public read(clazz: any, inputMessage: any): any {
        // inputMessage is expected to be the response body string/object
        if (typeof inputMessage === 'string') {
            return this.objectMapper.parse(inputMessage, { mainCreator: () => [clazz] });
        }
        return this.objectMapper.parse(JSON.stringify(inputMessage), { mainCreator: () => [clazz] });
    }

    public write(t: any, contentType?: string): any {
        return this.objectMapper.stringify(t);
    }
}
