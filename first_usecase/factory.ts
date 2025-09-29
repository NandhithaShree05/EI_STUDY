// 1. Product Interface (Renamed from Document to ProductDocument)
interface ProductDocument {
    render(): string;
}

// 2. Concrete Products (Renamed from PDFDocument/HTMLDocument)
class PdfDocument implements ProductDocument {
    render(): string {
        return "Rendering PDF document (formatted for print).";
    }
}

class WebDocument implements ProductDocument {
    render(): string {
        return "Rendering HTML document (formatted for web).";
    }
}

// 3. Creator Abstract Class (Factory - Renamed from DocumentFactory)
abstract class DocumentGenerator {
    // The Factory Method - subclasses must implement this
    public abstract createDocument(): ProductDocument;
    
    public processDocument(): string {
        const document = this.createDocument();
        return `Document created. Status: ${document.render()}`;
    }
}

// 4. Concrete Creators (Updated to use new Product names)
class PdfDocumentGenerator extends DocumentGenerator {
    public createDocument(): ProductDocument {
        return new PdfDocument();
    }
}

class WebDocumentGenerator extends DocumentGenerator {
    public createDocument(): ProductDocument {
        return new WebDocument();
    }
}

// Client Usage
const pdfFactory = new PdfDocumentGenerator();
console.log(`PDF Processor: ${pdfFactory.processDocument()}`);

const htmlFactory = new WebDocumentGenerator();
console.log(`HTML Processor: ${htmlFactory.processDocument()}`);