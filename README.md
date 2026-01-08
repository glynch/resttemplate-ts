# resttemplate-ts

A TypeScript framework that clones the Java Spring `RestTemplate` API, utilizing `axios` for HTTP requests and `jackson-js` for robust object mapping and serialization.

## Features

- **Spring-like API**: `getForObject`, `postForEntity`, `exchange`, etc.
- **Object Mapping**: Automatic JSON-to-Class serialization/deserialization using `jackson-js`.
- **Interceptors**: Support for `ClientHttpRequestInterceptor` to modify requests/responses.
- **Error Handling**: `ResponseErrorHandler` interface for handling HTTP errors.
- **Strongly Typed**: Built with TypeScript for type safety.

## Installation

Ensure you have the required dependencies installed:

```bash
npm install axios jackson-js reflect-metadata
```

(Note: `reflect-metadata` is required for `jackson-js` decorators to work properly).

## Configuration

Ensure your `tsconfig.json` has the following enabled for decorators:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Usage

### 1. Define Data Models

Use `jackson-js` decorators to define your data models. This ensures types are preserved during serialization and deserialization.

```typescript
import { JsonProperty, JsonClassType } from 'jackson-js';

export class User {
    @JsonProperty()
    @JsonClassType({type: () => [Number]})
    id: number;

    @JsonProperty()
    @JsonClassType({type: () => [String]})
    name: string;

    @JsonProperty()
    @JsonClassType({type: () => [String]})
    email: string;

    constructor(id?: number, name?: string, email?: string) {
        this.id = id || 0; // Default values or handling needed for strict property init
        this.name = name || '';
        this.email = email || '';
    }
}
```

### 2. Basic Requests

```typescript
import { RestTemplate } from './RestTemplate'; // Adjust path
import { User } from './dto/User';

const restTemplate = new RestTemplate();

// GET request
async function getUser() {
    const user = await restTemplate.getForObject<User>('https://api.example.com/users/1', User);
    console.log(`User Name: ${user?.name}`);
}

// POST request
async function createUser() {
    const newUser = new User(undefined, 'John Doe', 'john@example.com');
    
    // postForEntity returns ResponseEntity with headers, status, etc.
    const response = await restTemplate.postForEntity<User>('https://api.example.com/users', newUser, User);
    
    console.log(`Status: ${response.getStatusCode()}`); // 201
    console.log(`Created ID: ${response.getBody()?.id}`);
}
```

### 3. Using Interceptors

You can add interceptors to modify outgoing requests or incoming responses (e.g., adding authentication headers).

```typescript
import { ClientHttpRequestInterceptor, ClientHttpRequestExecution } from './http/client/ClientHttpRequestInterceptor';
import { HttpMethod } from './http/HttpMethod';
import { HttpHeaders } from './http/HttpHeaders';

const authInterceptor: ClientHttpRequestInterceptor = {
    intercept: async (url: string, method: HttpMethod, headers: HttpHeaders, body: any, execution: ClientHttpRequestExecution) => {
        headers.set('Authorization', 'Bearer my-token');
        console.log(`Sending ${method} request to ${url}`);
        return execution.execute(url, method, headers, body);
    }
};

restTemplate.setInterceptors([authInterceptor]);
```
