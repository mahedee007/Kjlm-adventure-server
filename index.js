const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lgger.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
      await client.connect();
      console.log("database connected!");
      const database = client.db('travelDB');
      const destinationsCollection = database.collection('destinations');
      const bookDestinationCollection = database.collection('bookDestination');

      //get destinations api
        app.get('/destinations', async(req,res)=>{
          const cursor = destinationsCollection.find({});
          const destinations = await cursor.toArray();
          res.send({destinations});
        });


        //get single destination
        app.get('/destinations/:id', async (req,res)=>{
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await destinationsCollection.findOne(query);
           res.json(result);
        });

        //add single destination
        app.post("/destinations", async (req, res) => {
          console.log(req.body);
          const result = await destinationsCollection.insertOne(req.body);
          res.json(result);
        });

        //booking tour
        app.post("/bookDestination", async (req, res) => {
          console.log(req.body);
          const result = await bookDestinationCollection.insertOne(req.body);
          res.send(result);
        });

        //delete single booking
        app.delete('/bookDestination/:id', async (req,res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await bookDestinationCollection.deleteOne(query);
          res.json(result);
        });

        //get my booking
        app.get("/bookDestination/:email", async (req, res) => {
          const result = await bookDestinationCollection.find({
            email: req.params.email,
          }).toArray();
          res.send(result);
        });

        //get all bookings
        app.get("/bookDestination", async (req, res) => {
          const result = await bookDestinationCollection.find({}).toArray();
          res.send(result);
          console.log(result);
        });

        //update status
        app.put("/bookDestination/:id", async (req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const option = {upsert: true};
          const updateDoc = {$set:{
             status: "Approved"
          }}
          const result = await bookDestinationCollection.updateOne(query, updateDoc, option)
          res.send(result);
        });

    }
    finally{
       //await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send("server running!");
});

app.listen(port, ()=>{
    console.log('Running server port : ', port);
});