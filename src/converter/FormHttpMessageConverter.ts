import { HttpMessageConverter } from './HttpMessageConverter';

export class FormHttpMessageConverter implements HttpMessageConverter<any> {
    public canRead(clazz: any, mediaType?: string): boolean {
        return false; // Typically these endpoints don't return form data
    }

    public canWrite(clazz: any, mediaType?: string): boolean {
        if (!mediaType) return false;
        return this.getSupportedMediaTypes().includes(mediaType);
    }

    public getSupportedMediaTypes(): string[] {
        return ['application/x-www-form-urlencoded'];
    }

    public read(clazz: any, inputMessage: any): any {
        throw new Error('FormHttpMessageConverter does not support reading');
    }

    public write(t: any, contentType?: string): any {
        // t should be a string (key=value&...) or a URLSearchParams object or an arbitrary object
        if (typeof t === 'string') {
            return t;
        }
        if (t instanceof URLSearchParams) {
            return t.toString();
        }
        // If it's a plain object, convert to query string
        const params = new URLSearchParams();
        for (const key in t) {
            if (Object.prototype.hasOwnProperty.call(t, key)) {
                params.append(key, String(t[key]));
            }
        }
        return params.toString();
    }
}
