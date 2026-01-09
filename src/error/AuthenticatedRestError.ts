import { JsonProperty, JsonClassType } from 'jackson-js';

export class AuthenticatedRestError {
    @JsonProperty()
    @JsonClassType({ type: () => [Number] })
    errorCode: number;

    @JsonProperty()
    @JsonClassType({ type: () => [String] })
    message: string;

    constructor(errorCode: number = 0, message: string = '') {
        this.errorCode = errorCode;
        this.message = message;
    }

    public getErrorCode(): number {
        return this.errorCode;
    }

    public getMessage(): string {
        return this.message;
    }
}
