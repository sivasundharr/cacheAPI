import express from 'express';
import { getCachedDataByKey,
    getAllKeys,createData,removeKey,removeAllKeys,updateDataByKey }  from '../controllers/cache.js';

const router = express.Router();

// Read/write a single key
router.get('/:key',getCachedDataByKey);

// Get All the keys
router.get('/',getAllKeys);

// Create Data for existing key
router.post('/',createData);

// Update Data for a key
router.put('/:key',updateDataByKey);

//Remove All the keys 
router.delete('/',removeAllKeys);

//Remove particular key only
router.delete('/:key',removeKey);


export default router;