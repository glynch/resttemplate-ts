import { MediaType } from './MediaType';

describe('MediaType', () => {

    it('should parse media type', () => {
        const mediaType = MediaType.parseMediaType('application/json');
        expect(mediaType.getType()).toBe('application');
        expect(mediaType.getSubtype()).toBe('json');
        expect(mediaType.getQualityValue()).toBe(1.0);
    });

    it('should parse media type with parameters', () => {
        const mediaType = MediaType.parseMediaType('application/json;charset=UTF-8');
        expect(mediaType.getType()).toBe('application');
        expect(mediaType.getSubtype()).toBe('json');
        expect(mediaType.getParameter('charset')).toBe('UTF-8');
    });

    it('should parse media type with quality factor', () => {
        const mediaType = MediaType.parseMediaType('text/html;q=0.8');
        expect(mediaType.getType()).toBe('text');
        expect(mediaType.getSubtype()).toBe('html');
        expect(mediaType.getQualityValue()).toBe(0.8);
    });

    it('should check includes', () => {
        const json = MediaType.APPLICATION_JSON;
        const all = MediaType.ALL;
        expect(all.includes(json)).toBe(true);
        expect(json.includes(all)).toBe(false);
    });

    it('should check compatibility', () => {
        const json = MediaType.APPLICATION_JSON;
        const all = MediaType.ALL;
        expect(all.isCompatibleWith(json)).toBe(true);
        expect(json.isCompatibleWith(all)).toBe(true);
    });

    it('should sort by quality value', () => {
        const mt1 = MediaType.parseMediaType('text/html;q=0.5');
        const mt2 = MediaType.parseMediaType('text/html;q=1.0');
        const list = [mt1, mt2];
        MediaType.sortByQualityValue(list);
        expect(list[0]).toBe(mt2);
        expect(list[1]).toBe(mt1);
    });

    it('should handle constructor with quality value', () => {
        const mediaType = new MediaType('text', 'html', 0.7);
        expect(mediaType.getQualityValue()).toBe(0.7);
    });

    it('should parse multiple media types', () => {
        const types = MediaType.parseMediaTypes("text/html, application/json");
        expect(types.length).toBe(2);
        expect(types[0].getType()).toBe('text');
        expect(types[0].getSubtype()).toBe('html');
        expect(types[1].getType()).toBe('application');
        expect(types[1].getSubtype()).toBe('json');
    });
});
