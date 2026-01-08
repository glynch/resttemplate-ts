import { RestTemplate } from '../src/RestTemplate';
import { User } from './dto/User';

async function main() {
    console.log('--- RestTemplate TypeScript Example ---');
    const restTemplate = new RestTemplate();

    try {
        // 1. GET Request
        console.log('\n1. Fetching User ID 1...');
        const user = await restTemplate.getForObject<User>('https://jsonplaceholder.typicode.com/users/1', User);
        if (user) {
            console.log(`[SUCCESS] Retrieved User: ${user.name} (@${user.username})`);
        }

        // 2. POST Request
        console.log('\n2. Creating a new User...');
        const newUser = new User(undefined, 'Alice Wonderland', 'alice_w', 'alice@example.com');
        const entity = await restTemplate.postForEntity<User>('https://jsonplaceholder.typicode.com/users', newUser, User);

        console.log(`[SUCCESS] Created User. Status: ${entity.getStatusCode()}`);
        console.log(`Response Body ID: ${entity.getBody()?.id}`);

        // 3. Error Handling
        console.log('\n3. Testing 404 Error...');
        try {
            await restTemplate.getForObject<User>('https://jsonplaceholder.typicode.com/users/99999', User);
        } catch (e: any) {
            console.log(`[EXPECTED ERROR] Caught error: ${e.message}`);
        }

    } catch (e) {
        console.error('An unexpected error occurred:', e);
    }
}

main();
