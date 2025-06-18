const express = require("express");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.json());

//Routes
const inspectionsRoute = require("./routes/inspections");
app.use("/api/inspections", inspectionsRoute);

//Root Route
app.get("/", (req, res) => {
  res.send("Environmental Inspection API is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
