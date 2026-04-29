const express = require("express");
const apiRoutes = require("./routes/api");

const app = express();

app.use(express.json());
app.use("/api", apiRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server berjalan" });
});

app.listen(3000, () => {
  console.log("Server berjalan pada localhost:3000");
});
