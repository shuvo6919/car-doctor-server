const express = require('express')
var cors = require('cors')
var cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000

//MidleWare
app.use(cors({
    origin: ["http://localhost:5173", "https://car-doctor-2-1362a.web.app", "https://car-doctor-2-1362a.firebaseapp.com "],
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,

}))
app.use(express.json());
app.use(cookieParser())


//Self made midleware-----------------------
const logger = async (req, res, next) => {
    console.log("Called the midle wRE");
    next();
}

const verifyToken = async (req, res, next) => {
    console.log(req.cookies.token);
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ message: "Not Authorized" })
    }
    jwt.verify(token, process.env.Access_Token_Secret, (err, decoded) => {
        //Error
        if (err) {
            console.log(err);
            return res.status(401).send({ message: "UNAUTHORIZED" })
        }

        //Decoding
        console.log("Decoded token==", decoded);
        req.user = decoded
        console.log(req.user.email)

    });
    next();
}




const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

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
        // await client.connect();

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // const database = client.db("sample_mflix");
        // const movies = database.collection("movies");

        const servicesCollection = client.db('carDoctor').collection('services');
        const ordersCollection = client.db("carDoctor").collection("orders")


        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        //Authentication--------------------

        app.post("/jwt", async (req, res) => {
            const userEmail = req.body.userEmail

            const token = jwt.sign({
                email: userEmail
            }, process.env.Access_Token_Secret, { expiresIn: '1h' });


            res.cookie('token', token, cookieOptions)

            // res.send({ success: true })
            res.send({ success: true })

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
        app.get("/orders", verifyToken, async (req, res) => {

            console.log('Cookiesssss: ', req.cookies)

            if (req.query.email !== req.user.email) {
                return res.status(401).send({ message: "Unauthorized" })
            }

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
