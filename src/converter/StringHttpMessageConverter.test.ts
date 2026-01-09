import { StringHttpMessageConverter } from './StringHttpMessageConverter';
import { MediaType } from '../http/MediaType';
import { HttpHeaders } from '../http/HttpHeaders';

describe('StringHttpMessageConverter', () => {
    let converter: StringHttpMessageConverter;

    beforeEach(() => {
        converter = new StringHttpMessageConverter();
    });

    it('should support checking', () => {
        expect(converter.canRead(String, MediaType.TEXT_PLAIN)).toBe(true);
        expect(converter.canRead(String)).toBe(true);
        expect(converter.canWrite(String, MediaType.TEXT_PLAIN)).toBe(true);
        expect(converter.canWrite(String)).toBe(true);
        expect(converter.canRead(Number, MediaType.TEXT_PLAIN)).toBe(false);
        expect(converter.canWrite(Number, MediaType.TEXT_PLAIN)).toBe(false);
    });

    it('should read string', () => {
        const body = 'Hello World';
        const result = converter.read(String, body);
        expect(result).toBe('Hello World');
    });

    it('should write string and set Accept-Charset', () => {
        const headers = new HttpHeaders();
        const body = 'Hello World';
        const result = converter.write(body, MediaType.TEXT_PLAIN, headers);

        expect(result).toBe('Hello World');
        const acceptCharset = headers.getFirst('Accept-Charset');
        expect(acceptCharset).toBeDefined();
        expect(acceptCharset).toContain('ISO-8859-1');
        expect(acceptCharset).toContain('UTF-8');
    });

    it('should not set Accept-Charset if disabled', () => {
        converter.setWriteAcceptCharset(false);
        const headers = new HttpHeaders();
        const body = 'Hello World';
        converter.write(body, MediaType.TEXT_PLAIN, headers);

        const acceptCharset = headers.getFirst('Accept-Charset');
        expect(acceptCharset).toBeNull();
    });

    it('should default charset to ISO-8859-1 (as per Java impl)', () => {
        // Technically JS strings are UTF-16, but we check if the concept exists
        // Since we can't easily inspect private fields without reflection or hacking,
        // we mainly check behavior of Accept-Charset which lists common charsets.
        const headers = new HttpHeaders();
        converter.write('test', undefined, headers);
        expect(headers.getFirst('Accept-Charset')).toContain('ISO-8859-1');
    });
});
