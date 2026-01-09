import { ClientHttpRequestInterceptor, ClientHttpRequestExecution } from '../client/ClientHttpRequestInterceptor';
import { HttpMethod } from '../HttpMethod';
import { HttpHeaders } from '../HttpHeaders';

export class CsrfTokenInterceptor implements ClientHttpRequestInterceptor {
    public async intercept(url: string, method: HttpMethod, headers: HttpHeaders, body: any, execution: ClientHttpRequestExecution): Promise<any> {
        headers.set('X-CRSF-TOKEN', ''); // Empty for now as requested
        return execution.execute(url, method, headers, body);
    }
}
