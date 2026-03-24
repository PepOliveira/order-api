const express = require("express");
const cors = require("cors");
const collectionRoutes = require("./routes/collectionRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/collections", collectionRoutes);
app.use("/api/testimonials", testimonialRoutes);

const port = process.env.PORT || 3001; // Change to 3001 to leave 3000 free for Next.js

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});