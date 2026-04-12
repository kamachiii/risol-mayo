const express = require("express"); //import express
const app = express(); // Membuat object express

const userController = require("./controllers/userController.js");

app.get("/", (req, res) => {
res.send("Hello World");
});


// routing untuk users
app.get("/users", userController.index);

app.post("/users", userController.store);

app.put("/users/:id", userController.update);

app.delete("/users/:id", userController.destroy);



// Mendefinisikan port.
app.listen(3000, () => {
console.log("Server berjalan pada localhost:3000");
});
