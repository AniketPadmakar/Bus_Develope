require("dotenv").config();
const ConnectionDB = require("./database");
const express = require("express");
const cors = require("cors");
const path = require("path");
require('./models/User');
require('./models/Admin');
ConnectionDB();


const app = express()

const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use("/api/user", require("./routes/user/auth"))
app.use("/api/admin", require("./routes/admin/auth"))
app.use("/api/admin", require("./routes/admin/bus"))


app.listen(port, () => {
    console.log(` backend listening at http://localhost:${port}`)
  })