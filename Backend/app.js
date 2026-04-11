const express = require("express");
const apiRoutes = require("./routes/api");

const app = express();

app.use(express.json()); // ⬅️ WAJIB untuk POST & PUT
app.use("/api", apiRoutes);
app.use(express.json());

app.listen(3000, () => {
  console.log("Server berjalan pada localhost:3000");
});