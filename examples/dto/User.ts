import { JsonProperty, JsonClassType, JsonIgnoreProperties } from 'jackson-js';

@JsonIgnoreProperties({ ignoreUnknown: true })
export class User {
    @JsonProperty()
    @JsonClassType({ type: () => [Number] })
    id: number;

    @JsonProperty()
    @JsonClassType({ type: () => [String] })
    name: string;

    @JsonProperty()
    @JsonClassType({ type: () => [String] })
    username: string;

    @JsonProperty()
    @JsonClassType({ type: () => [String] })
    email: string;

    constructor(id?: number, name?: string, username?: string, email?: string) {
        this.id = id || 0;
        this.name = name || '';
        this.username = username || '';
        this.email = email || '';
    }
}
