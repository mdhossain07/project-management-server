const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.esabfel.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const taskCollection = client.db("teamDB").collection("tasks");
    const userCollection = client.db("teamDB").collection("users");

    app.post("/api/v1/create-user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // app.get("/api/v1/user/:email", async (req, res) => {
    //   const { email } = req.params;
    //   const query = { email: email };
    //   const result = await userCollection.findOne(query);
    //   res.send(result);
    // });

    app.post("/api/v1/add-task", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.get("/api/v1/tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    app.get("/api/v1/get-task/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.get("/api/v1/task/:email", async (req, res) => {
      const { email } = req.params;
      const query = {
        createdBy: email,
      };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.patch(`/api/v1/update-status/:id`, async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedtStatus = {
        $set: {
          status: status,
        },
      };
      const result = await taskCollection.updateOne(filter, updatedtStatus);
      res.send(result);
    });

    app.patch(`/api/v1/update-task/:id`, async (req, res) => {
      const { id } = req.params;
      const task = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedtStatus = {
        $set: {
          title: task.title,
          priority: task.priority,
          image: task.image,
          deadline: task.deadline,
          description: task.description,
        },
      };
      const result = await taskCollection.updateOne(filter, updatedtStatus);
      res.send(result);
    });

    app.delete("/api/v1/remove-task/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server has started");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
