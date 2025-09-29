import * as readline from "readline";

// 1. Strategy Interface (Abstract Discount Strategy)
interface DiscountStrategy {
    calculateDiscount(price: number): number;
}

// 2. Concrete Strategies (Specific Algorithms)
class PercentageDiscount implements DiscountStrategy {
    constructor(private percentage: number) {}

    calculateDiscount(price: number): number {
        return price * (this.percentage / 100);
    }
}

class FlatRateDiscount implements DiscountStrategy {
    constructor(private amount: number) {}

    calculateDiscount(price: number): number {
        // Ensure discount doesn't exceed the price
        return Math.min(price, this.amount); 
    }
}

// 3. Context (The E-commerce Shopping Cart)
class ShoppingCart {
    private strategy: DiscountStrategy | null = null;

    constructor(private price: number) {}

    setDiscountStrategy(strategy: DiscountStrategy): void {
        this.strategy = strategy;
    }

    getFinalPrice(): number {
        if (!this.strategy) {
            console.log("No discount applied.");
            return this.price;
        }
        
        const discount = this.strategy.calculateDiscount(this.price);
        const finalPrice = this.price - discount;
        console.log(`Original Price: $${this.price.toFixed(2)}, Discount Applied: $${discount.toFixed(2)}`);
        return finalPrice;
    }
}

// Setup input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user for inputs
rl.question("Enter product price: ", (priceStr) => {
  const price = parseFloat(priceStr);

  rl.question("Enter discount type (percentage/flat): ", (type) => {

    rl.question("Enter discount value: ", (valueStr) => {
      const value = parseFloat(valueStr);

      // Create cart
      const cart = new ShoppingCart(price);

      if (type.toLowerCase() === "percentage") {
        cart.setDiscountStrategy(new PercentageDiscount(value));
      } else if (type.toLowerCase() === "flat") {
        cart.setDiscountStrategy(new FlatRateDiscount(value));
      } else {
        console.log("Invalid discount type!");
        rl.close();
        return;
      }

      console.log(`Final Price: $${cart.getFinalPrice().toFixed(2)}`);
      rl.close();
    });

  });
});
