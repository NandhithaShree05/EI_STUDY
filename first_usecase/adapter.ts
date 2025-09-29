// 1. Target Interface (What the Modern App expects)
interface ModernAuth {
    login(username: string, token: string): boolean;
}

// 2. Adaptee (The Legacy System with an incompatible interface)
class LegacyAuthSystem {
    public authenticateUser(username: string, passwordHash: string): boolean {
        // Legacy logic: checks hash
        if (username === "admin" && passwordHash === "e2d3c4b5a6f7") {
            console.log("Legacy System: Authentication successful!");
            return true;
        }
        console.log("Legacy System: Authentication failed.");
        return false;
    }
}

// 3. Adapter (Converts the Legacy interface to the Modern one)
class LegacyAuthAdapter implements ModernAuth {
    private _legacySystem: LegacyAuthSystem;

    constructor(legacySystem: LegacyAuthSystem) {
        this._legacySystem = legacySystem;
    }
    
    // Implements the Target interface (login)
    public login(username: string, token: string): boolean {
        // Internal logic to 'convert' the modern request into a legacy call
        console.log(`Adapter: Translating Modern login request for ${username}...`);
        
        // Pass the token as the expected passwordHash
        return this._legacySystem.authenticateUser(username, token);
    }
}

// Client Usage
const legacySystem = new LegacyAuthSystem();
const adapter = new LegacyAuthAdapter(legacySystem);

// The Modern App only knows how to call 'login(username, token)'
console.log("--- Modern App Login Attempt ---");
let success = adapter.login("admin", "e2d3c4b5a6f7");
console.log(`Modern App Login Status: ${success ? 'SUCCESS' : 'FAILURE'}\n`);

console.log("--- Failed Modern App Login Attempt ---");
let fail = adapter.login("guest", "wronghash");
console.log(`Modern App Login Status: ${fail ? 'SUCCESS' : 'FAILURE'}`);