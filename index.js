require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 9988

app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://default_ashaansojib:9080Sojib@cluster0.ugrpd0k.mongodb.net/?retryWrites=true&w=majority";

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        //! collections
        const toolAndDriver = client.db("o-gsm-service").collection("tool-driver");


        // ====================--tools and driver apis--===================
        app.get("/all-tools", async (req, res, next) => {
            const filter = await toolAndDriver.find().toArray();
            res.send(filter);
            next();
        });
        app.post("/add-tool", async (req, res, next) => {
            const data = req.body;
            const result = await toolAndDriver.insertOne(data);
            res.send(result);
            next();
        });

        app.get("/unique-tools", async (req, res, next) => {
            try {
                const uniqueBrands = await toolAndDriver
                    .aggregate([
                        {
                            $group: {
                                _id: "$brand",
                                documentId: { $first: "$_id" },
                            },
                        },
                        {
                            $project: {
                                _id: "$documentId",
                                brand: "$_id",
                            },
                        },
                    ])
                    .toArray();

                res.send(uniqueBrands);
                next();
            } catch (error) {
                console.error("Error fetching unique brands:", error);
                res.status(500).send("Internal Server Error");
            }
        });
        // todo load all data, need to get specific data
        app.get("/tool-category/:brand", async (req, res, next) => {
            const brand = req.params.brand;
            const allBrand = { brand: { $regex: brand, $options: "i" } };
            const result = await toolAndDriver.find(allBrand).toArray();
            res.send(result);
            next();
        });
        app.get("/single-tool/:id", async (req, res, next) => {
            const id = req.params.id;
            const data = { _id: new ObjectId(id) };
            const filter = await toolAndDriver.findOne(data);
            res.send(filter);
            next();
        });
        app.delete("/remove-tool/:id", async (req, res, next) => {
            const id = req.params.id;
            const data = { _id: new ObjectId(id) };
            const filter = await toolAndDriver.deleteOne(data);
            res.send(filter);
            next();
        });

        // Send a ping to confirm a successful connection
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

app.get('/', async (req, res) => {
    res.send("the server is running on")
});
app.listen(port, async (req, res) => {
    console.log("the server is running on: 9988")
});