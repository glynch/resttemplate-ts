import { MimeType } from './MimeType';

describe('MimeType', () => {
    it('should parse valid mime type', () => {
        const mimeType = MimeType.valueOf('text/plain');
        expect(mimeType.getType()).toBe('text');
        expect(mimeType.getSubtype()).toBe('plain');
        expect(mimeType.isConcrete()).toBe(true);
    });

    it('should parse mime type with parameters', () => {
        const mimeType = MimeType.valueOf('application/json; charset=UTF-8');
        expect(mimeType.getType()).toBe('application');
        expect(mimeType.getSubtype()).toBe('json');
        expect(mimeType.getParameter('charset')).toBe('UTF-8');
    });

    it('should handle wildcards', () => {
        const mimeType = MimeType.valueOf('*/*');
        expect(mimeType.isWildcardType()).toBe(true);
        expect(mimeType.isWildcardSubtype()).toBe(true);
    });

    it('should handle wildcard subtype', () => {
        const mimeType = MimeType.valueOf('text/*');
        expect(mimeType.isWildcardType()).toBe(false);
        expect(mimeType.isWildcardSubtype()).toBe(true);
    });

    it('should handle suffix wildcards', () => {
        const mimeType = MimeType.valueOf('application/*+json');
        expect(mimeType.isWildcardSubtype()).toBe(true);
    });

    it('should includes() correctly', () => {
        const all = MimeType.valueOf('*/*');
        const textPlain = MimeType.valueOf('text/plain');
        const textAll = MimeType.valueOf('text/*');

        expect(all.includes(textPlain)).toBe(true);
        expect(textAll.includes(textPlain)).toBe(true);
        expect(textPlain.includes(all)).toBe(false);
    });

    it('should be compatible with', () => {
        const textPlain = MimeType.valueOf('text/plain');
        const textAll = MimeType.valueOf('text/*');

        expect(textPlain.isCompatibleWith(textAll)).toBe(true);
        expect(textAll.isCompatibleWith(textPlain)).toBe(true);
    });

    it('equals should compare parameters', () => {
        const m1 = MimeType.valueOf('text/plain; charset=UTF-8');
        const m2 = MimeType.valueOf('text/plain; charset=UTF-8');
        const m3 = MimeType.valueOf('text/plain; charset=ISO-8859-1');

        expect(m1.equals(m2)).toBe(true);
        expect(m1.equals(m3)).toBe(false);
    });
});
