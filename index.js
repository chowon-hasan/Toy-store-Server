const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clustermain.vdf6goj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const alltoys = client.db("toyStore").collection("allToys");

    app.post("/addtoys", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await alltoys.insertOne(body);
      res.send(result);
      console.log(body);
    });

    app.get("/alltoys", async (req, res) => {
      const result = await alltoys.find().toArray();
      res.send(result);
    });

    app.get("/mytoys/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await alltoys.find({ email: req.params.email }).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy store server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
