import NodeCache from "node-cache";
import CacheData from '../models/cacheData.js';
import Randomstring from "randomstring";

const newCache = new NodeCache({maxKeys:process.env.MKEYS,stdTTL:process.env.STDTTL,checkperiod:process.env.CHECKPERIOD});

const checkMaxLimit = numberOfKeys => process.env.MAXIMUMKEYS == numberOfKeys ? true : false;

var forward = false;

export const getCachedDataByKey = async(req,res) =>{
    
    const { key }  = req.params;

    const catchData = newCache.get( key )
    if(catchData == undefined ){
        console.log('Cache Miss');
        const currentKeysCount = newCache.keys().length;
        if(checkMaxLimit(currentKeysCount)){
            newCache.del(newCache.keys()[0]);
        }
        const randomStr = Randomstring.generate();

        const success = newCache.set(randomStr,{});

        const newData = CacheData({key:randomStr,data:{}})
        try{
            await newData.save();
        }catch(err){
            res.status(404).json({message:err.message});
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

export const getAllKeys = (req,res) =>{
    try{
        const keys = newCache.keys();
        if(keys) return res.json(keys);
    }
    catch(err){
        console.log(err);
    }
}

export const createData = async(req,res) =>{
    const { key,data } = req.body;
    let success;
    try{
        forward = false;
        if(!(newCache.get(key))) {
            let obj ={ params:{key,data} }
            forward = true;
            const randomStr  = getCachedDataByKey(obj,res); 
            return;
        }
        else{
            success = newCache.set(key,data);

            const newData = CacheData({key:key,data:data})
            try{
                await newData.save();
            }catch(err){
                res.status(404).json({message:err.message});
            }
        }
        if(success) return res.json({'message':'Data created'})
    }
    catch(err){
        console.log(err);
    }
}

/*export const updateDataByKey = async(req,res) =>{

    const { key } = req.params;
    const { data } = req.body;

    try{
        const success = newCache.set(key,data);

        if(success) return res.json({'message':'updated'});
    }
    catch(err){
        console.log(err);
    }
}*/

export const removeKey = async(req,res) =>{

    const { key } = req.params;
    try{
        const result = newCache.del( key );

        try{
            await CacheData.findOneAndDelete({key:key});
        }catch(err){
            res.json({message:err.message});
        }

        if(result) return res.json({"message":"key removed"});
    }
    catch(err){
        console.log(err);
    }
}

export const removeAllKeys = async(req,res) =>{
    try{
        await CacheData.deleteMany({});
        newCache.flushAll();
        res.json(newCache.keys());
    }
    catch(err){
        console.log(err);
    }
}