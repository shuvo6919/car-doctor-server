const express = require('express')
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

//MidleWare
app.use(cors())
app.use(express.json());


console.log(process.env.DB_User)

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.j7egbu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // const database = client.db("sample_mflix");
        // const movies = database.collection("movies");

        const servicesCollection = client.db('carDoctor').collection('services');
        const ordersCollection = client.db("carDoctor").collection("orders")


        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        //Services-------------------------------------------
        app.get("/services", async (req, res) => {
            const cursor = servicesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })

        //Orders---------------------------------
        app.get("/orders", async (req, res) => {

            console.log(req.query)
            let query = {};
            if (req.query?.email) {
                query = {
                    email: req.query.email,
                }
            }

            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray()

            res.send(result)
        })
        app.post("/orders", async (req, res) => {

            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result)
        })
        app.delete("/orders/:id", async (req, res) => {
            console.log(req.params)
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.send(result)
        })











        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
    } finally {
        // // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
