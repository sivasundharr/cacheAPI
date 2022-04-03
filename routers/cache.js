import express from 'express';
import { getCatchedDataByKey,
    getAllKeys,createData,removeKey,removeAllKeys }  from '../controllers/cache.js';

const router = express.Router();

router.get('/:key',getCatchedDataByKey);
router.get('/',getAllKeys);
router.post('/',createData);
//router.put('/:key',updateDataByKey);
router.delete('/',removeAllKeys);
router.delete('/:key',removeKey);


export default router;