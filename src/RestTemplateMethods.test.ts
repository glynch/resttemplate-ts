import { RestTemplate } from './RestTemplate';
import { HttpMethod } from './http/HttpMethod';
import { HttpHeaders } from './http/HttpHeaders';
import { HttpEntity } from './http/HttpEntity';
import { MediaType } from './http/MediaType';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RestTemplate Methods', () => {
    let restTemplate: RestTemplate;

    beforeEach(() => {
        // Mock default instance creation
        mockedAxios.create.mockReturnThis();
        restTemplate = new RestTemplate();
        // Reset mock implementation for each test
        mockedAxios.request.mockReset();
    });

    it('should expand URI variables (Object)', async () => {
        mockedAxios.request.mockResolvedValue({
            data: {},
            headers: {},
            status: 200,
            statusText: 'OK'
        });

        await restTemplate.getForObject('http://example.com/users/{id}', Object, { id: 123 });

        expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://example.com/users/123',
            method: 'GET'
        }));
    });

    it('should expand URI variables (Array)', async () => {
        mockedAxios.request.mockResolvedValue({
            data: {},
            headers: {},
            status: 200,
            statusText: 'OK'
        });

        await restTemplate.getForObject('http://example.com/users/{}/posts/{}', Object, [123, 456]);

        expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://example.com/users/123/posts/456',
            method: 'GET'
        }));
    });

    it('should support headForHeaders', async () => {
        mockedAxios.request.mockResolvedValue({
            data: null,
            headers: { 'custom-header': 'value' },
            status: 200,
            statusText: 'OK'
        });

        const headers = await restTemplate.headForHeaders('http://example.com');
        expect(headers.getFirst('custom-header')).toBe('value');
        expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
            method: 'HEAD'
        }));
    });

    it('should support postForLocation', async () => {
        mockedAxios.request.mockResolvedValue({
            data: {},
            headers: { 'location': 'http://example.com/123' },
            status: 201,
            statusText: 'Created'
        });

        const headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        const request = new HttpEntity({ name: 'test' }, headers);

        const location = await restTemplate.postForLocation('http://example.com', request);
        expect(location).toBe('http://example.com/123');
        expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            data: JSON.stringify({ name: 'test' })
        }));
    });

    it('should support put', async () => {
        mockedAxios.request.mockResolvedValue({
            data: {},
            headers: {},
            status: 200,
            statusText: 'OK'
        });

        const headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        const request = new HttpEntity({ name: 'updated' }, headers);

        await restTemplate.put('http://example.com/1', request);
        expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
            method: 'PUT',
            data: JSON.stringify({ name: 'updated' })
        }));
    });

    it('should support delete', async () => {
        mockedAxios.request.mockResolvedValue({
            data: {},
            headers: {},
            status: 204,
            statusText: 'No Content'
        });

        await restTemplate.delete('http://example.com/1');
        expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
            method: 'DELETE'
        }));
    });

    it('should support optionsForAllow', async () => {
        mockedAxios.request.mockResolvedValue({
            data: {},
            headers: { 'allow': 'GET, POST, OPTIONS' },
            status: 200,
            statusText: 'OK'
        });

        const methods = await restTemplate.optionsForAllow('http://example.com');
        expect(methods.has(HttpMethod.GET)).toBe(true);
        expect(methods.has(HttpMethod.POST)).toBe(true);
        expect(methods.has(HttpMethod.DELETE)).toBe(false);
        expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
            method: 'OPTIONS'
        }));
    });
});
