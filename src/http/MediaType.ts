import { MimeType } from '../util/MimeType';

export class MediaType extends MimeType {
    public static readonly ALL = new MediaType("*", "*");
    public static readonly ALL_VALUE = "*/*";

    public static readonly APPLICATION_ATOM_XML = new MediaType("application", "atom+xml");
    public static readonly APPLICATION_ATOM_XML_VALUE = "application/atom+xml";

    public static readonly APPLICATION_CBOR = new MediaType("application", "cbor");
    public static readonly APPLICATION_CBOR_VALUE = "application/cbor";

    public static readonly APPLICATION_FORM_URLENCODED = new MediaType("application", "x-www-form-urlencoded");
    public static readonly APPLICATION_FORM_URLENCODED_VALUE = "application/x-www-form-urlencoded";

    public static readonly APPLICATION_JSON = new MediaType("application", "json");
    public static readonly APPLICATION_JSON_VALUE = "application/json";

    public static readonly APPLICATION_JSON_UTF8 = new MediaType("application", "json", new Map([["charset", "utf-8"]]));
    public static readonly APPLICATION_JSON_UTF8_VALUE = "application/json;charset=UTF-8";

    public static readonly APPLICATION_OCTET_STREAM = new MediaType("application", "octet-stream");
    public static readonly APPLICATION_OCTET_STREAM_VALUE = "application/octet-stream";

    public static readonly APPLICATION_PDF = new MediaType("application", "pdf");
    public static readonly APPLICATION_PDF_VALUE = "application/pdf";

    public static readonly APPLICATION_PROBLEM_JSON = new MediaType("application", "problem+json");
    public static readonly APPLICATION_PROBLEM_JSON_VALUE = "application/problem+json";

    public static readonly APPLICATION_PROBLEM_XML = new MediaType("application", "problem+xml");
    public static readonly APPLICATION_PROBLEM_XML_VALUE = "application/problem+xml";

    public static readonly APPLICATION_RSS_XML = new MediaType("application", "rss+xml");
    public static readonly APPLICATION_RSS_XML_VALUE = "application/rss+xml";

    public static readonly APPLICATION_STREAM_JSON = new MediaType("application", "stream+json");
    public static readonly APPLICATION_STREAM_JSON_VALUE = "application/stream+json";

    public static readonly APPLICATION_XHTML_XML = new MediaType("application", "xhtml+xml");
    public static readonly APPLICATION_XHTML_XML_VALUE = "application/xhtml+xml";

    public static readonly APPLICATION_XML = new MediaType("application", "xml");
    public static readonly APPLICATION_XML_VALUE = "application/xml";

    public static readonly IMAGE_GIF = new MediaType("image", "gif");
    public static readonly IMAGE_GIF_VALUE = "image/gif";

    public static readonly IMAGE_JPEG = new MediaType("image", "jpeg");
    public static readonly IMAGE_JPEG_VALUE = "image/jpeg";

    public static readonly IMAGE_PNG = new MediaType("image", "png");
    public static readonly IMAGE_PNG_VALUE = "image/png";

    public static readonly MULTIPART_FORM_DATA = new MediaType("multipart", "form-data");
    public static readonly MULTIPART_FORM_DATA_VALUE = "multipart/form-data";

    public static readonly MULTIPART_MIXED = new MediaType("multipart", "mixed");
    public static readonly MULTIPART_MIXED_VALUE = "multipart/mixed";

    public static readonly MULTIPART_RELATED = new MediaType("multipart", "related");
    public static readonly MULTIPART_RELATED_VALUE = "multipart/related";

    public static readonly TEXT_EVENT_STREAM = new MediaType("text", "event-stream");
    public static readonly TEXT_EVENT_STREAM_VALUE = "text/event-stream";

    public static readonly TEXT_HTML = new MediaType("text", "html");
    public static readonly TEXT_HTML_VALUE = "text/html";

    public static readonly TEXT_MARKDOWN = new MediaType("text", "markdown");
    public static readonly TEXT_MARKDOWN_VALUE = "text/markdown";

    public static readonly TEXT_PLAIN = new MediaType("text", "plain");
    public static readonly TEXT_PLAIN_VALUE = "text/plain";

    public static readonly TEXT_XML = new MediaType("text", "xml");
    public static readonly TEXT_XML_VALUE = "text/xml";

    private static readonly PARAM_QUALITY_FACTOR = "q";


    constructor(type: string, subtype?: string, parameters?: Map<string, string>);
    constructor(type: string, subtype?: string, qualityValue?: number);
    constructor(type: string, subtype: string = "*", parametersOrQuality: Map<string, string> | number = new Map()) {
        let params: Map<string, string>;
        if (typeof parametersOrQuality === 'number') {
            params = new Map();
            params.set(MediaType.PARAM_QUALITY_FACTOR, parametersOrQuality.toString());
        } else {
            params = parametersOrQuality;
        }
        super(type, subtype, params);
    }

    public getQualityValue(): number {
        const qualityFactory = this.getParameter(MediaType.PARAM_QUALITY_FACTOR);
        return qualityFactory ? parseFloat(qualityFactory) : 1.0;
    }

    public static includes(mediaType: MediaType | null, other: MediaType | null): boolean {
        if (!mediaType || !other) {
            return false;
        }
        return mediaType.includes(other);
    }

    public static valueOf(value: string): MediaType {
        return MediaType.parseMediaType(value);
    }

    public static parseMediaType(mediaType: string): MediaType {
        if (!mediaType) {
            throw new Error("MediaType must not be empty");
        }
        const mimeType = MimeType.valueOf(mediaType);
        return new MediaType(mimeType.getType(), mimeType.getSubtype(), mimeType.getParameters());
    }

    public static parseMediaTypes(mediaTypes: string): MediaType[] {
        if (!mediaTypes) {
            return [];
        }
        return mediaTypes.split(',').map(token => MediaType.parseMediaType(token.trim()));
    }

    public static toString(mediaTypes: MediaType[]): string {
        return mediaTypes.map(mt => mt.toString()).join(', ');
    }

    public static sortByQualityValue(mediaTypes: MediaType[]): void {
        mediaTypes.sort((type1, type2) => {
            const q1 = type1.getQualityValue();
            const q2 = type2.getQualityValue();
            return q2 - q1; // descending
        });
    }
}
