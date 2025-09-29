class ConfigurationManager {
    private static _instance: ConfigurationManager | null = null;
    private _settings: Map<string, any> = new Map();

    // The constructor is private to prevent direct instantiation
    private constructor() {
        console.log("Configuration Manager initialized.");
    }

    // Static method to get the single instance
    public static getInstance(): ConfigurationManager {
        if (ConfigurationManager._instance === null) {
            ConfigurationManager._instance = new ConfigurationManager();
        }
        return ConfigurationManager._instance;
    }

    public setSetting(key: string, value: any): void {
        this._settings.set(key, value);
        console.log(`Setting '${key}' updated.`);
    }

    public getSetting(key: string): any {
        return this._settings.get(key) ?? "Setting not found.";
    }
}

// Client Usage
// Get the first instance (it initializes)
const config1 = ConfigurationManager.getInstance();
config1.setSetting("DB_HOST", "localhost:5432");
config1.setSetting("MAX_THREADS", 8);

console.log("-".repeat(20));

// Get another instance (it returns the existing one)
const config2 = ConfigurationManager.getInstance();

// Check if both variables point to the same object
console.log(`Are config1 and config2 the same object? ${config1 === config2}`); // true

// config2 reads the setting set by config1
const dbHost = config2.getSetting("DB_HOST");
console.log(`Config 2 reads DB_HOST: ${dbHost}`);

// config2 updates a setting
config2.setSetting("MAX_THREADS", 16);

// config1 reads the updated setting
const maxThreads = config1.getSetting("MAX_THREADS");
console.log(`Config 1 reads MAX_THREADS: ${maxThreads}`);