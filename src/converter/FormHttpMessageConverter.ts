import { HttpMessageConverter } from './HttpMessageConverter';
import { MediaType } from '../http/MediaType';
import { HttpHeaders } from '../http/HttpHeaders';

export class FormHttpMessageConverter implements HttpMessageConverter<any> {
    public canRead(clazz: any, mediaType?: MediaType): boolean {
        return false; // Typically these endpoints don't return form data
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
        return [MediaType.APPLICATION_FORM_URLENCODED];
    }

    public read(clazz: any, inputMessage: any): any {
        throw new Error('FormHttpMessageConverter does not support reading');
    }

    public write(t: any, contentType?: MediaType, outputHeaders?: HttpHeaders): any {
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
