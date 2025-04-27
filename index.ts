import express, { Request, Response, RequestHandler } from 'express'; // Added Request, Response, RequestHandler types

import cors from 'cors';

import fs from 'fs';

import path from 'path';



// Define a type for Customer data (Good Practice)

interface Customer {

customerId: string;

name: string;

monthlyIncome: number;

monthlyExpenses: number;

creditScore: number;

outstandingLoans: number;

loanRepaymentHistory: number[];

accountBalance: number;

status: string;

}



const app = express();

const PORT = process.env.PORT || 50001;



// CORS Configuration
app.use(cors({
  origin: ['https://client-risk-dashboard.vercel.app', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));



app.use(express.json());



// Data file path

// Ensure 'data' directory is relative to the compiled JS file's location

const dataDirectory = path.join(__dirname, 'data');

const dataPath = path.join(dataDirectory, 'customers.json');


// Initialize with sample data

const initializeData = async () => {

try {

if (!fs.existsSync(dataDirectory)) {

console.log(`Creating data directory: ${dataDirectory}`);

fs.mkdirSync(dataDirectory, { recursive: true });

}



if (!fs.existsSync(dataPath)) {

console.log(`Creating sample data file: ${dataPath}`);

const sampleData: Customer[] = [

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

},
{

  "customerId": "CUST1003",
  
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

fs.writeFileSync(dataPath, JSON.stringify(sampleData, null, 2));

console.log('Sample data initialized');

} else {

console.log('Data file already exists:', dataPath);

}

} catch (err) {

console.error("Error during data initialization:", err);

// Depending on the severity, you might want to exit the process

// process.exit(1);

}

};



// --- Root route for basic check ---

app.get('/', (req: Request, res: Response) => {

res.send('Customer API is running!');

});

// --- End Root Route ---





// Routes

const getCustomers: RequestHandler = async (req, res) => {

console.log(`GET /api/customers - Attempting to read: ${dataPath}`);

try {

if (!fs.existsSync(dataPath)) {

console.error('Data file not found!');

res.status(500).json({ error: 'Data file not found on server' });

return;

}

const rawData = fs.readFileSync(dataPath, 'utf8');

const customers: Customer[] = JSON.parse(rawData);

res.json(customers);

} catch (err) {

console.error('Error reading customer data:', err);

res.status(500).json({ error: 'Failed to retrieve customers' });

}

};



// Update customer status

interface UpdateCustomerParams { id: string }

interface UpdateCustomerBody { status: string }

const updateCustomer: RequestHandler<UpdateCustomerParams, any, UpdateCustomerBody> = async (req, res) => {

const customerId = req.params.id;

const { status } = req.body;

console.log(`PUT /api/customers/${customerId} - Attempting update with status: ${status}`);



if (!status) {

res.status(400).json({ error: 'Missing status in request body' });

return;

}



try {

if (!fs.existsSync(dataPath)) {

console.error('Data file not found!');

res.status(500).json({ error: 'Data file not found on server' });

return;

}

const rawData = fs.readFileSync(dataPath, 'utf8');

const customers: Customer[] = JSON.parse(rawData);



const customerIndex = customers.findIndex(c => c.customerId === customerId);



if (customerIndex === -1) {

res.status(404).json({ error: 'Customer not found' });

return;

}



customers[customerIndex].status = status;

fs.writeFileSync(dataPath, JSON.stringify(customers, null, 2));



console.log(`Successfully updated status for customer ${customerId}`);

res.json(customers[customerIndex]);

} catch (err) {

console.error(`Error updating customer ${customerId}:`, err);

res.status(500).json({ error: 'Failed to update customer' });

}

};



app.get('/api/customers', getCustomers);

app.put('/api/customers/:id', updateCustomer);



// Alert endpoint

app.post('/api/alerts', (req: Request, res: Response) => {

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