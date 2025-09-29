import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';

// ------------------ Utility: Logger ------------------
class Logger {
    static info(msg: string) {
        console.log(`[INFO] ${msg}`);
    }
    static warn(msg: string) {
        console.warn(`⚠️ [WARN] ${msg}`);
    }
    static error(msg: string) {
        console.error(`❌ [ERROR] ${msg}`);
    }
}

// ------------------ Core Models ------------------
class ClientHandler {
    private socket: net.Socket;
    private _name?: string;
    private _room?: string;

    constructor(socket: net.Socket) {
        this.socket = socket;
    }

    get name(): string | undefined {
        return this._name;
    }
    set name(n: string | undefined) {
        this._name = n;
    }

    get room(): string | undefined {
        return this._room;
    }
    set room(r: string | undefined) {
        this._room = r;
    }

    send(message: string) {
        try {
            this.socket.write(message + '\n');
        } catch (err: any) {
            Logger.error(`Failed to send message to ${this._name || 'Unknown'}: ${err.message}`);
        }
    }

    equals(other: ClientHandler): boolean {
        return this.socket === other.socket;
    }
}

interface ChatRoom {
    name: string;
    messages: string[];
    clients: ClientHandler[];
}

// ------------------ Singleton: ChatRoomManager ------------------
class ChatRoomManager {
    private static instance: ChatRoomManager;
    private rooms: { [key: string]: ChatRoom } = {};
    private dataFolder: string;

    private constructor() {
        this.dataFolder = path.join(__dirname, 'chat_history');
        if (!fs.existsSync(this.dataFolder)) {
            fs.mkdirSync(this.dataFolder);
            Logger.info(`Created folder: ${this.dataFolder}`);
        }
    }

    static getInstance(): ChatRoomManager {
        if (!ChatRoomManager.instance) {
            ChatRoomManager.instance = new ChatRoomManager();
        }
        return ChatRoomManager.instance;
    }

    private getFilePath(roomName: string): string {
        return path.join(this.dataFolder, `${roomName}.json`);
    }

    private loadHistory(roomName: string): string[] {
        const filePath = this.getFilePath(roomName);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return [];
    }

    private saveHistory(roomName: string, messages: string[]) {
        const filePath = this.getFilePath(roomName);
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
    }

    getOrCreateRoom(roomName: string): ChatRoom {
        if (!this.rooms[roomName]) {
            this.rooms[roomName] = {
                name: roomName,
                clients: [],
                messages: this.loadHistory(roomName)
            };
        }
        return this.rooms[roomName];
    }

    addMessage(room: ChatRoom, message: string) {
        room.messages.push(message);
        this.saveHistory(room.name, room.messages);
    }

    removeClient(client: ClientHandler) {
        if (!client.room) return;
        const room = this.rooms[client.room];
        if (!room) return;

        room.clients = room.clients.filter(c => !c.equals(client));
        if (client.name) {
            this.broadcast(`🚪 ${client.name} left the room.`, client, true);
            this.sendActiveUsers(room);
        }
    }

    broadcast(message: string, sender?: ClientHandler, includeSender: boolean = false) {
        if (!sender?.room) return;
        const room = this.rooms[sender.room];
        room.clients.forEach(c => {
            if (includeSender || !c.equals(sender)) {
                c.send(message);
            }
        });
    }

    sendActiveUsers(room: ChatRoom) {
        const users = room.clients.map(c => c.name).filter(Boolean);
        const list = `👥 Active users: ${users.join(', ') || 'None'}`;
        room.clients.forEach(c => c.send(list));
    }

    sendPrivateMessage(sender: ClientHandler, recipientName: string, message: string) {
        if (!sender.room) return;
        const room = this.rooms[sender.room];
        const recipient = room.clients.find(c => c.name === recipientName);

        if (recipient) {
            recipient.send(`💌 [Private from ${sender.name}]: ${message}`);
            sender.send(`💌 [Private to ${recipientName}]: ${message}`);
        } else {
            sender.send(`⚠️ User "${recipientName}" not found in this room.`);
        }
    }
}

// ------------------ Adapter Pattern ------------------
interface ChatProtocolAdapter {
    startServer(): void;
}

class TcpChatAdapter implements ChatProtocolAdapter {
    private port: number;
    private manager: ChatRoomManager;

    constructor(port: number) {
        this.port = port;
        this.manager = ChatRoomManager.getInstance();
    }

    startServer() {
        const server = net.createServer((socket: net.Socket) => {
            const client = new ClientHandler(socket);
            client.send('Enter your name: ');

            socket.on('data', (data: Buffer) => {
                const message = data.toString().trim();
                try {
                    if (!client.name) {
                        client.name = message;
                        client.send('Enter chat room ID to join/create: ');
                    } else if (!client.room) {
                        client.room = message;
                        const room = this.manager.getOrCreateRoom(client.room);
                        room.clients.push(client);

                        // Send history
                        if (room.messages.length > 0) {
                            client.send('--- Message History ---');
                            room.messages.forEach(msg => client.send(msg));
                            client.send('--- End of History ---');
                        }

                        client.send(`✅ You joined room: ${client.room}`);
                        this.manager.broadcast(`🎉 ${client.name} joined the room.`, client, true);
                        this.manager.sendActiveUsers(room);
                    } else {
                        if (message === '/exit') {
                            socket.end('🚪 You left the chat.\n');
                        } else if (message === '/users') {
                            const room = this.manager.getOrCreateRoom(client.room);
                            this.manager.sendActiveUsers(room);
                        } else if (message.startsWith('@')) {
                            const [recipient, ...msgParts] = message.split(' ');
                            this.manager.sendPrivateMessage(client, recipient.substring(1), msgParts.join(' '));
                        } else {
                            const formatted = `[${client.name}]: ${message}`;
                            const room = this.manager.getOrCreateRoom(client.room);
                            this.manager.addMessage(room, formatted);
                            this.manager.broadcast(formatted, client, true);
                        }
                    }
                } catch (err: any) {
                    Logger.error(`Processing error: ${err.message}`);
                    client.send('⚠️ An error occurred while processing your message.');
                }
            });

            socket.on('end', () => this.manager.removeClient(client));
            socket.on('error', (err: Error) => {
                Logger.warn(`Client socket error: ${err.message}`);
                this.manager.removeClient(client);
            });
        });

        server.listen(this.port, () => {
            Logger.info(`✅ Chat server (TCP) running on port ${this.port}...`);
        });
    }
}

// ------------------ Main ------------------
const adapter: ChatProtocolAdapter = new TcpChatAdapter(5000);
adapter.startServer();
