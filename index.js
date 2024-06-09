const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

// Use bodyParser middleware
app.use(bodyParser.json());

// Enable CORS using the cors middleware
app.use(cors());

// Route for handling requests from the Angular client
app.get('/api/message', (req, res) => { 
  res.json({ message: 'Hello GEEKS FOR GEEKS Folks from the Express server!' }); 
}); 



app.use(express.json()); // Middleware to parse JSON bodies

app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  console.log('Received data:', req.body);
  
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  
  try {
    const user = await prisma.client.create({
      data: { email, username, password },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.client.findUnique({ where: { email } });

    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ message: 'Invalid email or password.' });
    }

    if (user.password !== password) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log('Login successful for user:', email);

    // Return username along with other details
    res.status(200).json({ id: user.id, email: user.email, username: user.username });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
});

app.get('/todo/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.client.findUnique({
      where: { username },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
});


app.get('/todos/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const todos = await prisma.toDoItem.findMany({
      where: { user: username },
    });

    if (todos.length === 0) {
      return res.status(404).json({ error: 'No todo items found for this user' });
    }

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todo items:', error);
    return res.status(500).json({ error: 'An error occurred while fetching todo items' });
  }
});

app.post('/todo', async (req, res) => {
  const { itemName, user } = req.body;


  try {
    const newItem = await prisma.toDoItem.create({
      data: {
        itemName: itemName,
        user: user,
      }
    });
    return res.json(newItem);
  } catch (error) {
    console.error("Error creating todo item:", error);
    return res.status(500).json({ error: "An error occurred while creating todo item." });
  }
});

app.get('/todo', async (req, res) => {
  try {
    const todoItems = await prisma.toDoItem.findMany();

    return res.json(todoItems);
  } catch (error) {
    console.error("Error fetching todo items:", error);
    return res.status(500).json({ error: "An error occurred while fetching todo items." });
  }
});

app.delete('/user/:username', async (req, res) => {
  const { username } = req.params;
  try {
    await prisma.client.delete({
      where: { username: username },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const {username, email, password } = req.body;
  try {
    const user = await prisma.client.update({
      where: { id: id },
      data: { username, email, password },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { itemName } = req.body;

  try {
    const updatedItem = await prisma.toDoItem.update({
      where: {
        id: id,
      },
      data: {
        itemName: itemName,
      },
    });
    return res.json(updatedItem);
  } catch (error) {
    console.error("Error updating todo item:", error);
    return res.status(500).json({ error: "An error occurred while updating todo item." });
  }
});

// Delete a todo item
app.delete("/todo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.toDoItem.delete({
      where: {
        id: id, // Expecting id to be a string
      },
    });
    return res.status(200).json({ message: "Todo item deleted successfully." });
  } catch (error) {
    console.error("Error deleting todo item:", error);
    return res.status(500).json({ error: "An error occurred while deleting todo item." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => { 
  console.log(`Server listening on port ${port}`); 
});