require("dotenv").config();
const express = require('express');
const path=require('path');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODBatlas_URL;

const dbName = "Project1";
const collectionName = "FakeAPI";

async function main() {
  const app = express();
  const port =process.env.port || 3000;

  const client = new MongoClient(uri);

  app.get('/',(req,res)=>{
      res.sendFile(path.join(__dirname,'/index.html'));
  })



  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    //TO FETCH ALL RECORDS
    app.get('/data', async (req, res) => {
      try {
        const data = await collection.find({}).toArray();
        res.json(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Internal Server Error");
      }
    });

   
    //TO FETCH RECORD ACCORDING TO ID
    app.get('/api/data/:id', async (req, res) => {
      const id = parseInt(req.params.id); 
    
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format. ID must be an integer.' });
      }
    
      try {
        const item = await collection.findOne({ id: id }); 
        if (item) {
          res.json(item);
        } else {
          res.status(404).json({ error: 'Data not found' });
        }
      } catch (error) {
        console.error('Error fetching data by ID:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });

    
    //TO FETCH RECORDS ACCORDING TO CATEGORY
    app.get('/api/data/category/:category', async (req, res) => {
      const category = req.params.category;
    
      try {
        const data = await collection.find({ 'categories.category': category }).toArray();
        if (data.length > 0) {
          res.json(data);
        } else {
          res.status(404).json({ error: `No data found for category: ${category}` });
        }
      } catch (error) {
        console.error('Error fetching data by category:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });

  
    //TO FETCH RECORDS ACCORDING TO CATEGORY AND SUB-CATEGORY
    app.get('/api/data/category/:category/subcategory/:subcategory', async (req, res) => {
      const category = req.params.category;
      const subcategory = req.params.subcategory;
    
      try {
        const data = await collection.find({
          'categories.category': category,
          'categories.sub-category': subcategory
        }).toArray();
    
        if (data.length > 0) {
          res.json(data);
        } else {
          res.status(404).json({
            error: `No data found for category: ${category} and sub-category: ${subcategory}`
          });
        }
      } catch (error) {
        console.error('Error fetching data by category and sub-category:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });


    //TO INSERT A NEW RECORD INTO THE COLLECTION
    app.post('/data', express.json(), async (req, res) => {
      try {
          const newData = req.body;
          const result = await collection.insertOne(newData);
          res.status(201).json(result);
      } catch (err) {
          console.error("Error inserting data:", err);
          res.status(500).send("Internal Server Error");
      }
    });

    
//TO UPDATE A RECORD IN THE COLLECTION PARTIALLY OR COMPLETELY
app.put('/data/:id', express.json(), async (req, res) => {
  try {
      const idFromUrl = req.params.id;
      const updateData = req.body;

      if (updateData.id !== parseInt(idFromUrl)) {
          return res.status(400).json({ error: 'ID in request body does not match ID in URL.' });
      }

      const result = await collection.updateOne({ id: parseInt(idFromUrl) }, {$set: updateData});
      res.json(result);
  } catch (err) {
      console.error("Error updating data:", err);
      res.status(500).send("Internal Server Error");
  }
});

//TO UPDATE A RECORD IN THE COLLECTION PARTIALLY
app.patch('/data/:id', express.json(), async (req, res) => {
  try {
      const idFromUrl = req.params.id;
      const updateData = req.body;

      if (updateData.id !== parseInt(idFromUrl)) {
          return res.status(400).json({ error: 'ID in request body does not match ID in URL.' });
      }

      const result = await collection.updateOne({ id: parseInt(idFromUrl) }, {$set: updateData});
      res.json(result);
  } catch (err) {
      console.error("Error updating data:", err);
      res.status(500).send("Internal Server Error");
  }
});


//TO DELETE A RECORD FROM THE COLLECTION
    app.delete('/data/:id', async (req, res) => {
      const id = parseInt(req.params.id); // Assuming 'id' in your data is an integer
    
      // Optional: Basic validation to ensure 'id' is a number
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format. ID must be an integer.' });
      }
    
      try {
        const item = await collection.deleteOne({ id: id }); // Querying to delete one collection
        if (item) {
          res.json(item);
        } else {
          res.status(404).json({ error: 'Data not found' });
        }
      } catch (error) {
        console.error('Error fetching data by ID:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

  } finally {
    
  }
}

main().catch(console.error);