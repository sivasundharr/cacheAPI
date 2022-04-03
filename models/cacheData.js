import mongoose from 'mongoose';

const cacheSchema = mongoose.Schema({
    key:String,
    data:Object
})

const CacheData = mongoose.model('CatchData',cacheSchema);

export default CacheData;