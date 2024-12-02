import { jwtDecode } from 'jwt-decode';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXJlbnQxQGV4YW1wbGUuY29tIiwiZXhwIjoxNzMyOTAzMDg0fQ.SyDZMcghCAht0P2hPGB4Rv8cVCx7dNoLm7Ffk2Bo6RU'; // Replace this with a valid JWT token for testing
try {
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);
} catch (error) {
    console.error('Error decoding token:', error);
}
