import * as net from 'net';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client: net.Socket = net.createConnection({ port: 5000 }, () => {
    console.log('📡 Connected to chat server.');
    console.log('👉 Commands: /exit = leave | /users = active users | @username msg = private message\n');
});

client.on('data', (data: Buffer) => {
    process.stdout.write(data.toString());
});

client.on('end', () => {
    console.log('\n❌ Disconnected from server.');
    process.exit(0);
});

client.on('error', (err: Error) => {
    console.error('⚠️ Connection error:', err.message);
    process.exit(1);
});

rl.on('line', (input: string) => {
    client.write(input);
});
