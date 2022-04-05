import CacheData from '../models/cacheData.js';

export const createFunction = async(key,value,res) =>{
    const newData = CacheData({key:key,data:value})
    try{
        await newData.save();
    }catch(err){
        return res.status(404).json({message:err.message});
    }
}

export const delFunction = async(key,value,res)=>{
    try{
        await CacheData.findOneAndDelete({key:key});
    }catch(err){
        return res.json({message:err.message})
    }
}

export const updateFunction = async(key,data,res) =>{
    try{
        await CacheData.findOneAndUpdate({key:key},{$set:{data:data}});
    }catch(err){
        return res.status(404).json({message:err.message});
    }
}

export const deleteAllFunction = async(res) =>{
    try{
        await CacheData.deleteMany({});
        newCache.flushAll();
        return res.status(200).json(newCache.keys());
    }
    catch(err){
        return res.status(404).json({message:err.message});
    }
}


export const checkMaxLimit = numberOfKeys => process.env.MAXIMUMKEYS == numberOfKeys ? true : false;