import * as readline from "readline";

// 1. Base Coffee (fixed)
interface Coffee {
    getCost(): number;
    getDescription(): string;
}

class SimpleCoffee implements Coffee {
    getCost(): number {
        return 5.0;
    }
    getDescription(): string {
        return "Simple Coffee";
    }
}

// 2. Decorator Base Class
abstract class CoffeeDecorator implements Coffee {
    protected coffee: Coffee;
    constructor(coffee: Coffee) {
        this.coffee = coffee;
    }
    getCost(): number {
        return this.coffee.getCost();
    }
    getDescription(): string {
        return this.coffee.getDescription();
    }
}

// 3. Concrete Decorators
class Milk extends CoffeeDecorator {
    private cost: number;
    constructor(coffee: Coffee, cost: number) {
        super(coffee);
        this.cost = cost;
    }
    getCost(): number {
        return super.getCost() + this.cost;
    }
    getDescription(): string {
        return super.getDescription() + ", Milk";
    }
}

class ExtraShot extends CoffeeDecorator {
    private cost: number;
    constructor(coffee: Coffee, cost: number) {
        super(coffee);
        this.cost = cost;
    }
    getCost(): number {
        return super.getCost() + this.cost;
    }
    getDescription(): string {
        return super.getDescription() + ", Extra Shot";
    }
}

// 4. User Interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let myCoffee: Coffee = new SimpleCoffee();
console.log(`Base Coffee: ${myCoffee.getDescription()}, Cost: $${myCoffee.getCost().toFixed(2)}`);

const askAddOns = () => {
    rl.question("Add Milk? (yes/no) ", (milkAnswer) => {
        if (milkAnswer.toLowerCase() === "yes") {
            rl.question("Enter Milk cost: ", (milkCost) => {
                myCoffee = new Milk(myCoffee, parseFloat(milkCost));
                nextAddOn();
            });
        } else {
            nextAddOn();
        }
    });
};

const nextAddOn = () => {
    rl.question("Add Extra Shot? (yes/no) ", (shotAnswer) => {
        if (shotAnswer.toLowerCase() === "yes") {
            rl.question("Enter Extra Shot cost: ", (shotCost) => {
                myCoffee = new ExtraShot(myCoffee, parseFloat(shotCost));
                showFinal();
            });
        } else {
            showFinal();
        }
    });
};

const showFinal = () => {
    console.log(`\nFinal Order: ${myCoffee.getDescription()}, Total Cost: $${myCoffee.getCost().toFixed(2)}`);
    rl.close();
};

askAddOns();
