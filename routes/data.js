const path = require('path');

const express = require('express');

const router = express.Router();

const tableController = require('../controllers/data');

router.post("/add-table", tableController.addTable); 
router.get("/getTable/:id", tableController.getTable );  
router.get("/getAllTables", tableController.getAllTables);
router.delete("/deleteRow/:tableName/:rowID", tableController.deleteRow); 
router.post("/insertData/:tableName", tableController.insertData); 
router.get("/getColumns/:tableName", tableController.getColumns);

module.exports = router;

