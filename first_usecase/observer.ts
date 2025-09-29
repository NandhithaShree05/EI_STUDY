import * as readline from "readline";

// Observer Interface
interface Observer {
    update(price: number): boolean; // return false to detach
}

// Subject
class StockMarket {
    private observers: Observer[] = [];
    private _price: number;

    constructor(initialPrice: number) {
        this._price = initialPrice;
    }

    attach(observer: Observer) { this.observers.push(observer); }
    detach(observer: Observer) {
        const idx = this.observers.indexOf(observer);
        if (idx > -1) this.observers.splice(idx, 1);
    }

    setPrice(newPrice: number) {
        console.log(`\n--- Stock Price Updated: $${newPrice} ---`);
        this._price = newPrice;
        this.observers = this.observers.filter(obs => obs.update(this._price));
    }

    hasObservers(): boolean { return this.observers.length > 0; }
}

// Concrete Observer
class InvestorApp implements Observer {
    constructor(private name: string, private sellThreshold: number) {}
    update(price: number): boolean {
        if (price >= this.sellThreshold) {
            console.log(`[${this.name}]: Price is $${price} → I want to sell! Detaching.`);
            return false;
        } else {
            console.log(`[${this.name}]: Price is $${price}. Monitoring...`);
            return true;
        }
    }
}

// Read input from user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter initial stock price: ", (priceInput) => {
    const initialPrice = parseFloat(priceInput);

    rl.question("Enter number of apps: ", (appsInput) => {
        const numApps = parseInt(appsInput);
        const stock = new StockMarket(initialPrice);
        let count = 0;

        const askThreshold = () => {
            if (count < numApps) {
                rl.question(`Enter name and sell threshold for app ${count + 1} (format: Name,Threshold): `, (input) => {
                    const [name, thresholdStr] = input.split(",");
                    const threshold = parseFloat(thresholdStr);
                    stock.attach(new InvestorApp(name.trim(), threshold));
                    count++;
                    askThreshold();
                });
            } else {
                rl.close();
                simulate(stock, initialPrice);
            }
        };

        askThreshold();
    });
});

// Simulate price changes
function simulate(stock: StockMarket, price: number) {
    while (stock.hasObservers()) {
        price += Math.floor(Math.random() * 10) + 1; // price increase
        stock.setPrice(price);
    }
    console.log("\nAll apps have sold. Simulation finished.");
}
