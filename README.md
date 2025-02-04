### Step 1: Set Up Your Environment

1. **Install Node.js**: Make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

2. **Create a New Directory**: Create a new directory for your project and navigate into it.

   ```bash
   mkdir my-backend
   cd my-backend
   ```

3. **Initialize a New Node.js Project**: Run the following command to create a `package.json` file.

   ```bash
   npm init -y
   ```

### Step 2: Install Required Packages

Install the necessary packages for your backend.

```bash
npm install express mongoose body-parser cors
```

- **express**: A web framework for Node.js.
- **mongoose**: An ODM for MongoDB.
- **body-parser**: Middleware to parse incoming request bodies.
- **cors**: Middleware to enable Cross-Origin Resource Sharing.

### Step 3: Set Up MongoDB

1. **Create a MongoDB Database**: If you don't have a MongoDB database, you can create one using [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or install MongoDB locally.

2. **Get Your Connection String**: If you're using MongoDB Atlas, get your connection string from the dashboard. It should look something like this:

   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority
   ```

### Step 4: Create the Backend Code

Create a file named `server.js` in your project directory and add the following code:

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create an Express application
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = 'YOUR_MONGODB_CONNECTION_STRING'; // Replace with your MongoDB connection string
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Define a schema and model
const DataSchema = new mongoose.Schema({
    name: String,
    value: Number,
});

const DataModel = mongoose.model('Data', DataSchema);

// Routes
app.post('/data', async (req, res) => {
    const { name, value } = req.body;
    const newData = new DataModel({ name, value });

    try {
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/data', async (req, res) => {
    try {
        const data = await DataModel.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### Step 5: Run Your Backend

1. **Start the Server**: Run the following command in your terminal:

   ```bash
   node server.js
   ```

2. **Test Your API**: You can use tools like Postman or curl to test your API.

   - **POST Request**: To add data, send a POST request to `http://localhost:5000/data` with a JSON body like:

     ```json
     {
       "name": "Sample Data",
       "value": 123
     }
     ```

   - **GET Request**: To retrieve data, send a GET request to `http://localhost:5000/data`.

### Step 6: (Optional) Use Environment Variables

For security reasons, it's a good practice to store sensitive information like your MongoDB connection string in environment variables. You can use the `dotenv` package for this.

1. **Install dotenv**:

   ```bash
   npm install dotenv
   ```

2. **Create a `.env` file** in your project root and add your MongoDB connection string:

   ```
   MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
   ```

3. **Update your `server.js`** to use the environment variable:

   ```javascript
   require('dotenv').config();
   const mongoURI = process.env.MONGODB_URI;
   ```

### Conclusion

You now have a basic backend set up with Node.js, Express, and MongoDB. You can expand this by adding more routes, validation, error handling, and other features as needed.