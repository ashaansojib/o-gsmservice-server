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
        const fileBD = client.db("o-gsm-service").collection("all-files");
        const serviceBD = client.db("o-gsm-service").collection("online-service")
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
        // ================--all flashfiles for home page--================
        app.get("/all-files", async (req, res, next) => {
            const files = await fileBD.find().toArray();
            res.send(files);
            next();
        });
        app.post("/add-file", async (req, res, next) => {
            const data = req.body;
            const post = await fileBD.insertOne(data);
            res.send(post);
            next();
        });
        app.get("/unique-posts", async (req, res, next) => {
            try {
                const uniqueBrands = await fileBD
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
        app.get("/file-brand/:brand", async (req, res, next) => {
            const query = req.params.brand;
            const filter = { brand: { $regex: query, $options: 'i' } };
            const files = await fileBD.find(filter).toArray();
            res.send(files);
            next();
        });
        app.get("/single-file/:id", async (req, res, next) => {
            const id = req.params.id;
            const data = { _id: new ObjectId(id) };
            const filter = await fileBD.findOne(data);
            res.send(filter);
            next();
        });
        app.delete("/remove-post/:id", async (req, res, next) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const remove = await fileBD.deleteOne(filter);
            res.send(remove);
            next();
        });


        // =======-------Online services------====================
        app.get("/o-services", async (req, res, next) => {
            const allPost = await serviceBD.find().toArray();
            res.send(allPost);
            next();
        });
        app.post("/add-service", async (req, res, next) => {
            const data = req.body;
            const posted = await serviceBD.insertOne(data);
            res.send(posted);
            next();
        });
        app.get("/service-category/:category", async (req, res, next) => {
            const name = req.params.category;
            const filter = { category: name };
            const result = await serviceBD.find(filter).toArray();
            res.send(result);
            next();
        });
        app.delete("/remove-service/:id", async (req, res, next) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const removed = await serviceBD.deleteOne(query);
            res.send(removed);
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