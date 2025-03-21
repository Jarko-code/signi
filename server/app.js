import express from "express";
import cors from "cors"; // Import the cors package
import { generate } from "random-words";

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins (you can customize this if needed)
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body

// In-memory storage for words
let words = generate({
    exactly: 10000,
    formatter: (word, index) => {
        return index === 0
            ? word.slice(0, 1).toUpperCase().concat(word.slice(1))
            : word;
    },
}).map((word, index) => ({
    id: index + 1,
    word: word,
}));

app.get("/api/random-words", (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the page number from query, default to 1
    const pageSize = parseInt(req.query.pageSize) || 200; // Get the page size (number of items per page), default to 20

    // Calculate the start index for pagination
    const startIndex = (page - 1) * pageSize;

    // Slice the words array to get the current page's results
    const result = words.slice(startIndex, startIndex + pageSize);

    // Send back the results with pagination information
    res.json({
        page: page,
        pageSize: pageSize,
        totalItems: words.length,
        totalPages: Math.ceil(words.length / pageSize),
        data: result,
    });
});

// POST route - Add a new word
app.post("/api/random-words", (req, res) => {
    const { word } = req.body; // Get the word from the request body
    if (!word) {
        return res.status(400).json({ error: "Word is required" });
    }

    // Find the highest existing ID
    const lastId = words.length > 0 ? Math.max(...words.map((w) => w.id)) : 0;
    const newId = lastId + 1;

    // Create a new word object with the incremented ID
    const newWord = {
        id: newId,
        word: word,
    };

    words.push(newWord); // Add the new word to the array
    res.status(201).json(newWord); // Respond with the new word and 201 status
});

// PUT route - Update a word by id
app.put("/api/random-words/:id", (req, res) => {
    const { id } = req.params;
    const { word } = req.body; // Get the updated word from the request body

    if (!word) {
        return res.status(400).json({ error: "Word is required" });
    }

    // Find the word by ID and update it
    const index = words.findIndex((w) => w.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ error: "Word not found" });
    }

    words[index].word = word; // Update the word
    res.json(words[index]); // Respond with the updated word
});

// DELETE route - Delete a word by id
app.delete("/api/random-words/:id", (req, res) => {
    const { id } = req.params;

    // Find the word by ID and remove it
    const index = words.findIndex((w) => w.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ error: "Word not found" });
    }

    const deletedWord = words.splice(index, 1); // Remove the word from the array
    res.json({ message: "Word deleted", deletedWord: deletedWord[0] }); // Respond with a success message
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
