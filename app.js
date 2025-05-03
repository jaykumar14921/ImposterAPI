require("dotenv").config();
const express = require('express');
const path=require('path');
const { MongoClient } = require('mongodb');
const { link } = require("fs");
const cors=require("cors");
const Product = require('./models/product.js'); // Make sure the path is correct


const uri = process.env.MONGODBatlas_URL;

const dbName = "Project1";
const collectionName = "FakeAPI";

async function main() {
  const app = express();
  const PORT =process.env.PORT || 3000;

  const client = new MongoClient(uri);

  app.use(cors());

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  })

  app.get('/docs',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
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


    // TO FETCH RECORDS WITH PAGINATION
    app.get('/data/limit', async (req, res) => {
      try {
        // Get page and limit from query params (default to page 1, limit 25)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 28;
        const category = req.query.category;

        // Basic validation for page and limit
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
          return res.status(400).json({ error: 'Invalid page or limit value.' });
        }

        // Calculate skip (how many documents to skip)
        const skip = (page - 1) * limit;
        let query={};

        if(category&&category!=='all'){
          query={'categories.category':category};
        }

        // Total number of documents
        const total = await collection.countDocuments(query);

        // Fetch documents with skip and limit
        const data = await collection.find(query)
          .skip(skip)
          .limit(limit)
          .toArray();

        const totalPages = Math.ceil(total / limit);

        res.json({
          data,
          total,
          page,
          totalPages
        });
      } catch (err) {
        console.error("Error fetching paginated data:", err);
        res.status(500).send("Internal Server Error");
      }
    });

   
    //TO FETCH RECORD ACCORDING TO ID
    app.get('/data/:id', async (req, res) => {
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

    //TO FETCH ALL CATEGORIES
    app.get('/api/categories', async (req, res) => {
      try {
        const distinctCategories = await collection.distinct('categories.category');
        if (distinctCategories.length > 0) {
          res.json(distinctCategories);
        } else {
          res.status(404).json({ error: 'No categories found' });
        }
      } catch (error) {
        console.error('Error fetching distinct categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
      }
    });

   //TO FETCH ALL SUB-CATEGORIES
    app.get('/api/sub-categories', async (req, res) => {
      try {
        const distinctsubCategories = await collection.distinct('categories.sub-category');
        if (distinctsubCategories.length > 0) {
          res.json(distinctsubCategories);
        } else {
          res.status(404).json({ error: 'No sub-category found' });
        }
      } catch (error) {
        console.error('Error fetching distinct sub-categories:', error);
        res.status(500).json({ error: 'Failed to fetch sub-categories' });
      }
    });


    
    
    //TO FETCH RECORDS ACCORDING TO CATEGORY
    app.get('/data/category/:category', async (req, res) => {
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
    app.get('/data/category/:category/sub-category/:subcategory', async (req, res) => {
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

    app.listen(PORT,'0.0.0.0', () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });

  } finally {
    
  }
}

main().catch(console.error);