export class MimeType {
    protected static readonly WILDCARD_TYPE = "*";
    private static readonly PARAM_CHARSET = "charset";
    private static readonly TOKEN: Set<number> = new Set();

    static {
        // variable names refer to RFC 2616, section 2.2
        const ctl = new Set<number>();
        for (let i = 0; i <= 31; i++) {
            ctl.add(i);
        }
        ctl.add(127);

        const separators = new Set<number>();
        const separatorChars = "()<>@,;:\\\"/[]?={} \t";
        for (let i = 0; i < separatorChars.length; i++) {
            separators.add(separatorChars.charCodeAt(i));
        }

        for (let i = 0; i < 128; i++) {
            if (!ctl.has(i) && !separators.has(i)) {
                MimeType.TOKEN.add(i);
            }
        }
    }

    private readonly type: string;
    private readonly subtype: string;
    private readonly parameters: Map<string, string>;

    constructor(type: string, subtype: string = MimeType.WILDCARD_TYPE, parameters: Map<string, string> = new Map()) {
        if (!type || type.length === 0) {
            throw new Error("type must not be empty");
        }
        if (!subtype || subtype.length === 0) {
            throw new Error("subtype must not be empty");
        }
        this.checkToken(type);
        this.checkToken(subtype);
        this.type = type.toLowerCase();
        this.subtype = subtype.toLowerCase();

        if (parameters && parameters.size > 0) {
            const map = new Map<string, string>();
            parameters.forEach((value, key) => {
                const attribute = key;
                this.checkParameters(attribute, value);
                map.set(attribute.toLowerCase(), value);
            });
            this.parameters = map;
        } else {
            this.parameters = new Map();
        }
    }

    private checkToken(token: string): void {
        for (let i = 0; i < token.length; i++) {
            const ch = token.charCodeAt(i);
            if (!MimeType.TOKEN.has(ch)) {
                throw new Error(`Invalid token character '${token[i]}' in token "${token}"`);
            }
        }
    }

    protected checkParameters(attribute: string, value: string): void {
        if (!attribute || attribute.length === 0) {
            throw new Error("parameter attribute must not be empty");
        }
        if (!value || value.length === 0) {
            throw new Error("parameter value must not be empty");
        }
        this.checkToken(attribute);
        if (MimeType.PARAM_CHARSET === attribute) {
            const unquoted = this.unquote(value);
            // In Java: Charset.forName(value). In JS we just accept the string, maybe validate standard charset names if strict.
            // keeping it simple for now as JS doesn't have a strict Charset class like Java.
        } else if (!this.isQuotedString(value)) {
            this.checkToken(value);
        }
    }

    private isQuotedString(s: string): boolean {
        if (s.length < 2) {
            return false;
        }
        return (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"));
    }

    protected unquote(s: string): string {
        if (!s) {
            return s;
        }
        return this.isQuotedString(s) ? s.substring(1, s.length - 1) : s;
    }

    public isWildcardType(): boolean {
        return MimeType.WILDCARD_TYPE === this.type;
    }

    public isWildcardSubtype(): boolean {
        return MimeType.WILDCARD_TYPE === this.subtype || this.subtype.startsWith("*+");
    }

    public isConcrete(): boolean {
        return !this.isWildcardType() && !this.isWildcardSubtype();
    }

    public getType(): string {
        return this.type;
    }

    public getSubtype(): string {
        return this.subtype;
    }

    public getCharset(): string | null {
        const charSet = this.getParameter(MimeType.PARAM_CHARSET);
        return charSet ? this.unquote(charSet) : null;
    }

    public getParameter(name: string): string | undefined {
        return this.parameters.get(name.toLowerCase());
    }

    public getParameters(): Map<string, string> {
        return this.parameters;
    }

    public includes(other: MimeType | null): boolean {
        if (!other) {
            return false;
        }
        if (this.isWildcardType()) {
            return true;
        }
        if (this.type === other.type) {
            if (this.subtype === other.subtype) {
                return true;
            }
            if (this.isWildcardSubtype()) {
                const thisPlusIdx = this.subtype.indexOf('+');
                if (thisPlusIdx === -1) {
                    return true;
                } else {
                    const otherPlusIdx = other.subtype.indexOf('+');
                    if (otherPlusIdx !== -1) {
                        const thisSubtypeNoSuffix = this.subtype.substring(0, thisPlusIdx);
                        const thisSubtypeSuffix = this.subtype.substring(thisPlusIdx + 1);
                        const otherSubtypeSuffix = other.subtype.substring(otherPlusIdx + 1);
                        if (thisSubtypeSuffix === otherSubtypeSuffix && MimeType.WILDCARD_TYPE === thisSubtypeNoSuffix) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public isCompatibleWith(other: MimeType | null): boolean {
        if (!other) {
            return false;
        }
        if (this.isWildcardType() || other.isWildcardType()) {
            return true;
        }
        if (this.type === other.type) {
            if (this.subtype === other.subtype) {
                return true;
            }
            if (this.isWildcardSubtype() || other.isWildcardSubtype()) {
                const thisPlusIdx = this.subtype.indexOf('+');
                const otherPlusIdx = other.subtype.indexOf('+');

                if (thisPlusIdx === -1 && otherPlusIdx === -1) {
                    return true;
                } else if (thisPlusIdx !== -1 && otherPlusIdx !== -1) {
                    const thisSubtypeNoSuffix = this.subtype.substring(0, thisPlusIdx);
                    const otherSubtypeNoSuffix = other.subtype.substring(0, otherPlusIdx);

                    const thisSubtypeSuffix = this.subtype.substring(thisPlusIdx + 1);
                    const otherSubtypeSuffix = other.subtype.substring(otherPlusIdx + 1);

                    if (thisSubtypeSuffix === otherSubtypeSuffix &&
                        (MimeType.WILDCARD_TYPE === thisSubtypeNoSuffix || MimeType.WILDCARD_TYPE === otherSubtypeNoSuffix)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (!(other instanceof MimeType)) {
            return false;
        }
        return this.type === other.type &&
            this.subtype === other.subtype &&
            this.parametersAreEqual(other);
    }

    private parametersAreEqual(other: MimeType): boolean {
        if (this.parameters.size !== other.parameters.size) {
            return false;
        }
        for (const [key, value] of this.parameters) {
            if (!other.parameters.has(key)) {
                return false;
            }
            if (MimeType.PARAM_CHARSET === key) {
                if (this.getCharset() !== other.getCharset()) {
                    return false;
                }
            } else {
                if (value !== other.parameters.get(key)) {
                    return false;
                }
            }
        }
        return true;
    }

    public toString(): string {
        let builder = `${this.type}/${this.subtype}`;
        this.parameters.forEach((value, key) => {
            builder += `;${key}=${value}`;
        });
        return builder;
    }

    public static valueOf(value: string): MimeType {
        if (!value) {
            throw new Error("MimeType must not be empty");
        }
        const index = value.indexOf(';');
        let type: string;
        let subtype: string | undefined;
        let params: Map<string, string> = new Map();

        if (index >= 0) {
            type = value.substring(0, index).trim();
            const paramsStr = value.substring(index + 1);
            // Simple param parsing
            paramsStr.split(';').forEach(param => {
                const eqIndex = param.indexOf('=');
                if (eqIndex >= 0) {
                    const attribute = param.substring(0, eqIndex).trim();
                    const val = param.substring(eqIndex + 1).trim();
                    params.set(attribute, val);
                }
            });
        } else {
            type = value.trim();
        }

        const slashIndex = type.indexOf('/');
        if (slashIndex >= 0) {
            subtype = type.substring(slashIndex + 1);
            type = type.substring(0, slashIndex);
        } else {
            subtype = MimeType.WILDCARD_TYPE;
        }

        return new MimeType(type, subtype, params);
    }
}
