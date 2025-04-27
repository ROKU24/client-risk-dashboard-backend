"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Added Request, Response, RequestHandler types
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 50001;
// CORS Configuration
app.use((0, cors_1.default)({
    origin: 'http://localhost:3002', // Updating to match the actual client port
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json());
// Data file path
// Ensure 'data' directory is relative to the compiled JS file's location
const dataDirectory = path_1.default.join(__dirname, 'data');
const dataPath = path_1.default.join(dataDirectory, 'customers.json');
// Initialize with sample data
const initializeData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!fs_1.default.existsSync(dataDirectory)) {
            console.log(`Creating data directory: ${dataDirectory}`);
            fs_1.default.mkdirSync(dataDirectory, { recursive: true });
        }
        if (!fs_1.default.existsSync(dataPath)) {
            console.log(`Creating sample data file: ${dataPath}`);
            const sampleData = [
                {
                    "customerId": "CUST1001",
                    "name": "Alice Johnson",
                    "monthlyIncome": 6200,
                    "monthlyExpenses": 3500,
                    "creditScore": 710,
                    "outstandingLoans": 15000,
                    "loanRepaymentHistory": [1, 0, 1, 1, 1, 1, 0, 1],
                    "accountBalance": 12500,
                    "status": "Review"
                },
                {
                    "customerId": "CUST1002",
                    "name": "Bob Smith",
                    "monthlyIncome": 4800,
                    "monthlyExpenses": 2800,
                    "creditScore": 640,
                    "outstandingLoans": 20000,
                    "loanRepaymentHistory": [1, 1, 1, 0, 0, 1, 0, 0],
                    "accountBalance": 7300,
                    "status": "Approved"
                }
            ];
            fs_1.default.writeFileSync(dataPath, JSON.stringify(sampleData, null, 2));
            console.log('Sample data initialized');
        }
        else {
            console.log('Data file already exists:', dataPath);
        }
    }
    catch (err) {
        console.error("Error during data initialization:", err);
        // Depending on the severity, you might want to exit the process
        // process.exit(1);
    }
});
// --- Root route for basic check ---
app.get('/', (req, res) => {
    res.send('Customer API is running!');
});
// --- End Root Route ---
// Routes
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`GET /api/customers - Attempting to read: ${dataPath}`);
    try {
        if (!fs_1.default.existsSync(dataPath)) {
            console.error('Data file not found!');
            res.status(500).json({ error: 'Data file not found on server' });
            return;
        }
        const rawData = fs_1.default.readFileSync(dataPath, 'utf8');
        const customers = JSON.parse(rawData);
        res.json(customers);
    }
    catch (err) {
        console.error('Error reading customer data:', err);
        res.status(500).json({ error: 'Failed to retrieve customers' });
    }
});
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.params.id;
    const { status } = req.body;
    console.log(`PUT /api/customers/${customerId} - Attempting update with status: ${status}`);
    if (!status) {
        res.status(400).json({ error: 'Missing status in request body' });
        return;
    }
    try {
        if (!fs_1.default.existsSync(dataPath)) {
            console.error('Data file not found!');
            res.status(500).json({ error: 'Data file not found on server' });
            return;
        }
        const rawData = fs_1.default.readFileSync(dataPath, 'utf8');
        const customers = JSON.parse(rawData);
        const customerIndex = customers.findIndex(c => c.customerId === customerId);
        if (customerIndex === -1) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        customers[customerIndex].status = status;
        fs_1.default.writeFileSync(dataPath, JSON.stringify(customers, null, 2));
        console.log(`Successfully updated status for customer ${customerId}`);
        res.json(customers[customerIndex]);
    }
    catch (err) {
        console.error(`Error updating customer ${customerId}:`, err);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});
app.get('/api/customers', getCustomers);
app.put('/api/customers/:id', updateCustomer);
// Alert endpoint
app.post('/api/alerts', (req, res) => {
    console.log('POST /api/alerts - Alert received:', req.body);
    // In a real app, you'd do something with the alert data
    res.status(200).json({ message: 'Alert logged successfully' });
});
// Initialize and start server
initializeData().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(initError => {
    console.error("Failed to initialize data, server not started:", initError);
    process.exit(1); // Exit if initialization fails critically
});
