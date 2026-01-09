import { ClientHttpRequestInterceptor, ClientHttpRequestExecution } from '../client/ClientHttpRequestInterceptor';
import { HttpMethod } from '../HttpMethod';
import { HttpHeaders } from '../HttpHeaders';
import { ResponseEntity } from '../ResponseEntity';

export class LoggingClientHttpRequestInterceptor implements ClientHttpRequestInterceptor {
    public async intercept(url: string, method: HttpMethod, headers: HttpHeaders, body: any, execution: ClientHttpRequestExecution): Promise<any> {
        console.log('--- Request ---');
        console.log(`URI: ${url}`);
        console.log(`Method: ${method}`);
        console.log('Headers:', JSON.stringify(headers.toObject(), null, 2));
        if (body) {
            console.log('Body:', JSON.stringify(body, null, 2));
        }

        const response: ResponseEntity<any> = await execution.execute(url, method, headers, body);

        console.log('--- Response ---');
        console.log(`Status code: ${response.getStatusCode()}`);
        console.log(`Status text: ${response.getStatusText()}`);
        console.log('Headers:', JSON.stringify(response.getHeaders().toObject(), null, 2));
        if (response.getBody()) {
            console.log('Body:', JSON.stringify(response.getBody(), null, 2));
        }

        return response;
    }
}
