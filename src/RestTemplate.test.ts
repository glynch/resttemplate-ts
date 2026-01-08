import { RestTemplate } from '../src/RestTemplate';
import { JsonClassType, JsonProperty, ObjectMapper } from 'jackson-js';
import { HttpMethod } from '../src/http/HttpMethod';
import { HttpHeaders } from '../src/http/HttpHeaders';

class Post {
    @JsonProperty()
    @JsonClassType({ type: () => [Number] })
    id: number;

    @JsonProperty()
    @JsonClassType({ type: () => [Number] })
    userId: number;

    @JsonProperty()
    @JsonClassType({ type: () => [String] })
    title: string;

    @JsonProperty()
    @JsonClassType({ type: () => [String] })
    body: string;

    constructor(id?: number, userId?: number, title?: string, body?: string) {
        this.id = id || 0;
        this.userId = userId || 0;
        this.title = title || '';
        this.body = body || '';
    }
}

describe('RestTemplate Integration Test', () => {
    let restTemplate: RestTemplate;

    beforeEach(() => {
        restTemplate = new RestTemplate();
    });

    it('should get a post (GET)', async () => {
        const post = await restTemplate.getForObject<Post>('https://jsonplaceholder.typicode.com/posts/1', Post);
        expect(post).toBeDefined();
        expect(post?.id).toBe(1);
        expect(post?.title).toBeDefined();
    });

    it('should create a post (POST)', async () => {
        const newPost = new Post(undefined, 1, 'foo', 'bar');
        const entity = await restTemplate.postForEntity<Post>('https://jsonplaceholder.typicode.com/posts', newPost, Post);
        expect(entity.getStatusCode()).toBe(201);
        expect(entity.getBody()?.title).toBe('foo');
    });

    it('should handle interceptors', async () => {
        let intercepted = false;
        restTemplate.setInterceptors([{
            intercept: async (url, method, headers, body, execution) => {
                intercepted = true;
                headers.add('X-Custom-Header', 'foobar');
                return execution.execute(url, method, headers, body);
            }
        }]);

        const post = await restTemplate.getForObject<Post>('https://jsonplaceholder.typicode.com/posts/1', Post);
        expect(intercepted).toBe(true);
        expect(post).toBeDefined();
    });

    it('should handle 404', async () => {
        await expect(restTemplate.getForObject<Post>('https://jsonplaceholder.typicode.com/posts/999999', Post))
            .rejects
            .toThrow(); // Default error handler throws
    });
});
