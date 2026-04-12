const express = require("express");
const apiRoutes = require("./routes/api");

const app = express();

app.use(express.json()); 
app.use("/api", apiRoutes);

app.listen(3000, () => {
  console.log("Server berjalan pada localhost:3000");
});