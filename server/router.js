const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const newRouter = (collection) => {
    const router = express.Router();
    
    // Function for catching errors, this is to keep the code DRY
    const errorCatcher = (inputError) => {
      console.error(inputError);
      res.status(500);
      res.json({ status: 500, error: inputError })
    }
    
    // Route for getting all data
    router.get('/', (req, res) => {
      collection
        .find()
        .toArray()
        .then((docs) => res.json(docs))
        .catch((err) => errorCatcher(err));
    });
  
    // Route for getting specific data
    router.get('/:id', (req, res) => {
      const id = req.params.id;
      collection
        .findOne({ _id: ObjectID(id) })
        .then((doc) => res.json(doc))
        .catch((err) => errorCatcher(err));
    });

     // Route for deleting specific data 
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    collection
      .deleteOne({ _id: ObjectID(id) })
      .then(() => collection.find().toArray())
      .then((docs) => res.json(docs))
      .catch((err) => errorCatcher(err));
  });

  // Route for creating new data
  router.post('/', (req, res) => {
    const newData = req.body;
    collection
    .insertOne(newData)
    .then((result) => {
      res.json(result.ops[0])
    })
    .catch((err) => errorCatcher(err));
  });

  // Route for updating specific data
 router.put('/:id', (req, res) => {
    const itemId = req.params.id;
    const updatedItem = req.body;
    
    collection
    .findOneAndUpdate({ _id: ObjectID(itemId) }, { $set: updatedItem })
    .then(result => {
      res.json(result.value);
    })
    .catch((err) => errorCatcher(err));
  });
  
  
  return router;

};

module.exports = newRouter;