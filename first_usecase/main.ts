import * as readline from "readline";

// ----------- User Input Helper -----------
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

// ---------------- Strategy Pattern ----------------
interface DiscountStrategy {
    calculateDiscount(price: number): number;
}

class PercentageDiscount implements DiscountStrategy {
    constructor(private percent: number) {}
    calculateDiscount(price: number) {
        return price * (this.percent / 100);
    }
}

class FlatDiscount implements DiscountStrategy {
    constructor(private amount: number) {}
    calculateDiscount(price: number) {
        return Math.min(price, this.amount);
    }
}

// ---------------- Observer Pattern ----------------
interface Observer { update(message: string): void; }

class SalesObserver implements Observer {
    constructor(private name: string) {}
    update(message: string) {
        console.log(`[${this.name}] Notification: ${message}`);
    }
}

class SalesSubject {
    private observers: Observer[] = [];
    attach(obs: Observer) { this.observers.push(obs); }
    detach(obs: Observer) { this.observers = this.observers.filter(o => o !== obs); }
    notify(msg: string) { this.observers.forEach(o => o.update(msg)); }
}

// ---------------- Factory Pattern ----------------
interface Invoice { generate(): string; }

class PdfInvoice implements Invoice { generate() { return "PDF Invoice generated"; } }
class HtmlInvoice implements Invoice { generate() { return "HTML Invoice generated"; } }

abstract class InvoiceFactory {
    abstract createInvoice(): Invoice;
    process() { return this.createInvoice().generate(); }
}

class PdfFactory extends InvoiceFactory { createInvoice() { return new PdfInvoice(); } }
class HtmlFactory extends InvoiceFactory { createInvoice() { return new HtmlInvoice(); } }

// ---------------- Singleton Pattern ----------------
class ConfigManager {
    private static _instance: ConfigManager;
    private _settings: Map<string, any> = new Map();
    private constructor() {}
    static getInstance() { if (!this._instance) this._instance = new ConfigManager(); return this._instance; }
    set(key: string, value: any) { this._settings.set(key, value); }
    get(key: string) { return this._settings.get(key); }
}

// ---------------- Adapter Pattern ----------------
interface Payment {
    pay(amount: number): boolean;
}

class LegacyPaymentSystem {
    makePayment(amount: number) {
        console.log(`Legacy Payment processed: $${amount}`);
        return true;
    }
}

class PaymentAdapter implements Payment {
    constructor(private legacy: LegacyPaymentSystem) {}
    pay(amount: number) { return this.legacy.makePayment(amount); }
}

// ---------------- Decorator Pattern ----------------
interface Coffee {
    getCost(): number;
    getDescription(): string;
}

class SimpleCoffee implements Coffee {
    getCost() { return 5; }
    getDescription() { return "Simple Coffee"; }
}

abstract class CoffeeDecorator implements Coffee {
    constructor(protected coffee: Coffee) {}
    getCost() { return this.coffee.getCost(); }
    getDescription() { return this.coffee.getDescription(); }
}

class Milk extends CoffeeDecorator {
    getCost() { return super.getCost() + 1.5; }
    getDescription() { return super.getDescription() + ", Milk"; }
}

class ExtraShot extends CoffeeDecorator {
    getCost() { return super.getCost() + 2; }
    getDescription() { return super.getDescription() + ", Extra Shot"; }
}

// ---------------- Main Application ----------------
async function main() {
    console.log("=== Welcome to Coffee Shop Simulator ===\n");

    const config = ConfigManager.getInstance();
    config.set("tax", 0.05);

    // 1. Decorator: Build Coffee
    let coffee: Coffee = new SimpleCoffee();
    const addMilk = await ask("Add Milk? (y/n): ");
    if (addMilk.toLowerCase() === "y") coffee = new Milk(coffee);
    const addShot = await ask("Add Extra Shot? (y/n): ");
    if (addShot.toLowerCase() === "y") coffee = new ExtraShot(coffee);
    console.log(`Order: ${coffee.getDescription()}, Base Cost: $${coffee.getCost()}`);

    // 2. Strategy: Apply Discount
    const discountType = await ask("Discount type (percentage/flat): ");
    let strategy: DiscountStrategy;
    if (discountType === "percentage") {
        const pct = parseFloat(await ask("Enter discount %: "));
        strategy = new PercentageDiscount(pct);
    } else {
        const amt = parseFloat(await ask("Enter flat discount amount: "));
        strategy = new FlatDiscount(amt);
    }
    const discountedPrice = coffee.getCost() - strategy.calculateDiscount(coffee.getCost());
    console.log(`Price after discount: $${discountedPrice.toFixed(2)}`);

    // 3. Observer: Notify Sales
    const sales = new SalesSubject();
    sales.attach(new SalesObserver("Manager"));
    if (discountedPrice > 6) sales.notify("High value order placed!");
    else sales.notify("Order placed.");

    // 4. Factory: Generate Invoice
    const invType = await ask("Invoice type (pdf/html): ");
    const factory = invType === "pdf" ? new PdfFactory() : new HtmlFactory();
    console.log(factory.process());

    // 5. Adapter: Process Payment
    const legacyPay = new LegacyPaymentSystem();
    const payment = new PaymentAdapter(legacyPay);
    payment.pay(discountedPrice);

    // 6. Singleton: Read Configuration
    console.log(`Tax Rate from Config: ${config.get("tax")}`);

    rl.close();
}

main();
