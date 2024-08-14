const express = require('express')
var cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

//MidleWare
// app.use(cors())
// app.use(express.json());


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



        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        app.get("/services", async (req, res) => {
            const cursor = servicesCollection.find();
            const result = await cursor.toArray();
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
