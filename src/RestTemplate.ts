import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpMethod } from './http/HttpMethod';
import { HttpHeaders } from './http/HttpHeaders';
import { HttpEntity } from './http/HttpEntity';
import { ResponseEntity, HttpStatus } from './http/ResponseEntity';
import { HttpMessageConverter } from './converter/HttpMessageConverter';
import { MappingJackson2HttpMessageConverter } from './converter/json/MappingJackson2HttpMessageConverter';
import { ResponseErrorHandler } from './error/ResponseErrorHandler';
import { DefaultResponseErrorHandler } from './error/DefaultResponseErrorHandler';
import { ClientHttpRequestInterceptor, ClientHttpRequestExecution } from './http/client/ClientHttpRequestInterceptor';
import { FormHttpMessageConverter } from './converter/FormHttpMessageConverter';
import { MediaType } from './http/MediaType';
import { StringHttpMessageConverter } from './converter/StringHttpMessageConverter';

export class RestTemplate {
    private converters: HttpMessageConverter<any>[];
    private errorHandler: ResponseErrorHandler;
    private interceptors: ClientHttpRequestInterceptor[];
    private axiosInstance: AxiosInstance;

    constructor(
        converters?: HttpMessageConverter<any>[],
        interceptors?: ClientHttpRequestInterceptor[]
    ) {
        this.converters = converters || [
            new StringHttpMessageConverter(),
            new FormHttpMessageConverter(),
            new MappingJackson2HttpMessageConverter()
        ];
        this.errorHandler = new DefaultResponseErrorHandler();
        this.interceptors = interceptors || [];
        this.axiosInstance = axios.create();
    }

    public setErrorHandler(errorHandler: ResponseErrorHandler): void {
        this.errorHandler = errorHandler;
    }

    public setMessageConverters(converters: HttpMessageConverter<any>[]): void {
        this.converters = converters;
    }

    public setInterceptors(interceptors: ClientHttpRequestInterceptor[]): void {
        this.interceptors = interceptors;
    }

    private expandUrl(url: string, uriVariables?: any): string {
        if (!uriVariables) {
            return url;
        }
        if (Array.isArray(uriVariables)) {
            let expandedUrl = url;
            uriVariables.forEach(value => {
                expandedUrl = expandedUrl.replace(/\{.*?\}/, String(value));
            });
            return expandedUrl;
        }
        return url.replace(/\{(\w+)\}/g, (_, key) => {
            return uriVariables[key] !== undefined ? String(uriVariables[key]) : `{${key}}`;
        });
    }

    public async getForObject<T>(url: string, responseType: any, uriVariables?: any): Promise<T | null> {
        const response = await this.exchange<T>(url, HttpMethod.GET, null, responseType, uriVariables);
        return response.getBody();
    }

    public async getForEntity<T>(url: string, responseType: any, uriVariables?: any): Promise<ResponseEntity<T>> {
        return this.exchange<T>(url, HttpMethod.GET, null, responseType, uriVariables);
    }

    public async headForHeaders(url: string, uriVariables?: any): Promise<HttpHeaders> {
        const response = await this.exchange(url, HttpMethod.HEAD, null, null, uriVariables);
        return response.getHeaders();
    }

    public async postForLocation(url: string, request: any, uriVariables?: any): Promise<string | null> {
        const response = await this.exchange(url, HttpMethod.POST, request instanceof HttpEntity ? request : new HttpEntity(request), null, uriVariables);
        return response.getHeaders().getFirst('Location');
    }

    public async postForObject<T>(url: string, request: any, responseType: any, uriVariables?: any): Promise<T | null> {
        let requestEntity: HttpEntity<any>;
        if (request instanceof HttpEntity) {
            requestEntity = request;
        } else {
            requestEntity = new HttpEntity(request);
        }
        const response = await this.exchange<T>(url, HttpMethod.POST, requestEntity, responseType, uriVariables);
        return response.getBody();
    }

    public async postForEntity<T>(url: string, request: any, responseType: any, uriVariables?: any): Promise<ResponseEntity<T>> {
        let requestEntity: HttpEntity<any>;
        if (request instanceof HttpEntity) {
            requestEntity = request;
        } else {
            requestEntity = new HttpEntity(request);
        }
        return this.exchange<T>(url, HttpMethod.POST, requestEntity, responseType, uriVariables);
    }

    public async put(url: string, request: any, uriVariables?: any): Promise<void> {
        let requestEntity: HttpEntity<any>;
        if (request instanceof HttpEntity) {
            requestEntity = request;
        } else {
            requestEntity = new HttpEntity(request);
        }
        await this.exchange(url, HttpMethod.PUT, requestEntity, null, uriVariables);
    }

    public async delete(url: string, uriVariables?: any): Promise<void> {
        await this.exchange(url, HttpMethod.DELETE, null, null, uriVariables);
    }

    public async optionsForAllow(url: string, uriVariables?: any): Promise<Set<HttpMethod>> {
        const response = await this.exchange(url, HttpMethod.OPTIONS, null, null, uriVariables);
        const allowHeader = response.getHeaders().getFirst('Allow');
        const methods = new Set<HttpMethod>();
        if (allowHeader) {
            allowHeader.split(',').forEach(m => methods.add(m.trim() as HttpMethod));
        }
        return methods;
    }

    public async setupRequestFactory(config: AxiosRequestConfig): Promise<void> {
        // Allows custom configuration of the axios instance if needed
        this.axiosInstance = axios.create(config);
    }

    public async exchange<T>(url: string, method: HttpMethod, requestEntity: HttpEntity<any> | null, responseType: any, uriVariables?: any): Promise<ResponseEntity<T>> {

        const expandedUrl = this.expandUrl(url, uriVariables);
        const headers = requestEntity ? requestEntity.getHeaders() : new HttpHeaders();
        const body = requestEntity ? requestEntity.getBody() : null;

        // Run Interceptors
        if (this.interceptors.length > 0) {
            const chain = new Chain(this.interceptors, this);
            chain.setResponseType(responseType);
            return chain.execute(expandedUrl, method, headers, body);
        }

        return this.doExecute(expandedUrl, method, headers, body, responseType);
    }

    public async doExecute<T>(url: string, method: HttpMethod, headers: HttpHeaders, body: any, responseType: any): Promise<ResponseEntity<T>> {

        // Prepare request body
        let requestBody = body;
        const contentType = headers.getContentType();

        if (body && this.converters) {
            for (const converter of this.converters) {
                if (converter.canWrite(body.constructor, contentType || undefined)) {
                    requestBody = converter.write(body, contentType || undefined, headers);
                    if (!contentType) {
                        const supported = converter.getSupportedMediaTypes();
                        if (supported && supported.length > 0) {
                            headers.setContentType(supported[0]);
                        }
                    }
                    break;
                }
            }
        }

        const axiosConfig: AxiosRequestConfig = {
            url: url,
            method: method as any,
            headers: headers.toObject() as any,
            data: requestBody,
            validateStatus: () => true, // Don't throw on error status, handle manually
        };

        try {
            const axiosResponse: AxiosResponse = await this.axiosInstance.request(axiosConfig);

            let responseBody = axiosResponse.data;
            // Deserialize response
            if (responseBody && this.converters && responseType) {
                const contentTypeResp = axiosResponse.headers['content-type'];
                let mediaType: MediaType | undefined;
                if (contentTypeResp) {
                    try {
                        mediaType = MediaType.parseMediaType(contentTypeResp);
                    } catch (ex) {
                        // ignore invalid media type
                    }
                }

                for (const converter of this.converters) {
                    if (converter.canRead(responseType, mediaType)) {
                        responseBody = converter.read(responseType, responseBody);
                        break;
                    }
                }
            }

            const responseHeaders = HttpHeaders.from(axiosResponse.headers);
            const responseEntity = new ResponseEntity<T>(responseBody, responseHeaders, axiosResponse.status, axiosResponse.statusText);

            if (await this.errorHandler.hasError(responseEntity)) {
                await this.errorHandler.handleError(responseEntity);
            }

            return responseEntity;

        } catch (error) {
            // If error handler threw, it will bubble up
            throw error;
        }
    }
}

class Chain implements ClientHttpRequestExecution {
    private interceptors: ClientHttpRequestInterceptor[];
    private index: number = 0;
    private restTemplate: RestTemplate;
    private responseType: any;

    constructor(interceptors: ClientHttpRequestInterceptor[], restTemplate: RestTemplate) {
        this.interceptors = interceptors;
        this.restTemplate = restTemplate;
    }

    // Changing execute signature to match ClientHttpRequestExecution
    public async execute(url: string, method: HttpMethod, headers: HttpHeaders, body: any): Promise<ResponseEntity<any>> {
        if (this.index < this.interceptors.length) {
            const interceptor = this.interceptors[this.index++];
            return interceptor.intercept(url, method, headers, body, this);
        } else {
            return this.restTemplate.doExecute(url, method, headers, body, this.responseType);
        }
    }

    public setResponseType(type: any) {
        this.responseType = type;
    }
}
