const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    // client.connect();

    const alltoys = client.db("toyStore").collection("allToys");

    // const indexKeys = { toyName: 1, category: 1 };
    // const indexOptions = { name: "titlecategory" };
    // const result = await alltoys.createIndex(indexKeys, indexOptions);

    // GET ALL DATA OPERATION
    app.get("/alltoys", async (req, res) => {
      const result = await alltoys
        .find()
        .sort({ price: 1, createdAt: -1 })
        .limit(20)
        .toArray();
      res.send(result);
    });

    // SEARCH OPERATION
    app.get("/toysearch/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await alltoys
        .find({
          $or: [
            { toyName: { $regex: searchText, $options: "i" } },
            { category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    // PUT DATA ON SERVER OPERATION
    app.post("/addtoys", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await alltoys.insertOne(body);
      res.send(result);
      console.log(body);
    });

    // GET DATA FOR SINGLE TOYS BY ID
    app.get("/singletoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await alltoys.findOne(query);
      res.send(result);
    });

    // GET DATA BY EMAIL OPERATION
    app.get("/mytoys/:email", async (req, res) => {
      const result = await alltoys
        .find({ email: req.params.email })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // UPDATE OPERATION
    app.put("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await alltoys.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // DELETE OPERATION
    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await alltoys.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy store server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
