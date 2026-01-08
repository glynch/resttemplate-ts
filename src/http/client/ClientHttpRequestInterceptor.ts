import { HttpHeaders } from '../../HttpHeaders';
import { HttpMethod } from '../../HttpMethod';

export interface ClientHttpRequestExecution {
    execute(url: string, method: HttpMethod, headers: HttpHeaders, body: any): Promise<any>;
}

export interface ClientHttpRequestInterceptor {
    intercept(url: string, method: HttpMethod, headers: HttpHeaders, body: any, execution: ClientHttpRequestExecution): Promise<any>;
}
