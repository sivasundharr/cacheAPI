import NodeCache from "node-cache";
import CacheData from '../models/cacheData.js';
import Randomstring from "randomstring";

const newCache = new NodeCache({maxKeys:process.env.MKEYS,stdTTL:process.env.STDTTL});

// whem ttl expired this callback called
newCache.on("expired",function(key,value){
    let resObj = { params:{key:key}};
    const resp = getCachedDataByKey(resObj,res);
    return resp;
});
// Check the maximum limit of cache
const checkMaxLimit = numberOfKeys => process.env.MAXIMUMKEYS == numberOfKeys ? true : false;

var forward = false;

//Read/create a key

export const getCachedDataByKey = async(req,res) =>{
    
    const { key }  = req.params;

    const catchData = newCache.get( key )
    if(catchData == undefined ){

        console.log('Cache Miss');

        const currentKeysCount = newCache.keys().length;

        if(checkMaxLimit(currentKeysCount)){
            const oldKey = newCache.keys()[0];
            try{
                await CacheData.deleteOne({key:oldKey})
            }catch(err){
                return res.json({message:err.message})
            }
            newCache.del(oldKey);
        }
        const randomStr = Randomstring.generate();

        const success = newCache.set(randomStr,{});

        const newData = CacheData({key:randomStr,data:{}})
        try{
            await newData.save();
        }catch(err){
            return res.status(404).json({message:err.message});
        }

        if(forward){
            let obj ={ body:{ key:randomStr,data:req.params.data } }
            createData(obj,res);
        }
        if(success) return res.json(randomStr);
    }
    else{
        newCache.del(key)
        newCache.set(key,catchData);
        console.log("Cache Hit");
        return res.json(catchData);
    }
}

// Get All the keys

export const getAllKeys = (req,res) =>{
    try{
        const keys = newCache.keys();
        if(keys) return res.json(keys);
    }
    catch(err){
        console.log(err);
    }
}
// create new data for existing key

export const createData = async(req,res) =>{
    const { key,data } = req.body;
    let success;

    forward = false;
    if(!(newCache.get(key))) {
        let obj ={ params:{key,data} }
        forward = true;
        const randomStr  = getCachedDataByKey(obj,res); 
        return;
    }
    else{
        success = newCache.set(key,data);
        try{
            await CacheData.findOneAndUpdate({key:key},{$set:{data:data}});
        }catch(err){
            return res.status(404).json({message:err.message});
        }
    }
    if(success) return res.json({'message':'Data created'})
    
}
// update data for a parameter key
export const updateDataByKey = async(req,res) =>{

    const { key } = req.params;
    const { data } = req.body;

    if(!newCache.get(key)) return res.json({'message':'key doesnot exist'})

    try{
        await CacheData.findOneAndUpdate({key:key},{$set:{data:data}});
        const success = newCache.set(key,data);
        if(success) return res.json({'message':'updated'});
    }
    catch(err){
        return res.json({message:err.message});
    }
}

//Remove a single key,value

export const removeKey = async(req,res) =>{

    const { key } = req.params;
    try{
        if(!newCache.get(key)) return res.json({'message':'key doesnot exist'})
        
        const result = newCache.del( key );

        try{
            await CacheData.findOneAndDelete({key:key});
        }catch(err){
            return res.json({message:err.message});
        }

        if(result) return res.json({"message":"key removed"});
    }
    catch(err){
        console.log(err);
    }
}

//Remove all the key value data

export const removeAllKeys = async(req,res) =>{
    if(newCache.keys().length <= 0) return res.json([])
    try{
        await CacheData.deleteMany({});
        newCache.flushAll();
        res.json(newCache.keys());
    }
    catch(err){
        console.log(err);
    }
}
