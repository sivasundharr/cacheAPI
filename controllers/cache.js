import express from 'express';
import NodeCache from "node-cache";
import Randomstring from "randomstring";
import { createFunction,delFunction,updateFunction,
    deleteAllFunction,checkMaxLimit } from '../utils/dbUtils.js';

const newCache = new NodeCache({maxKeys:process.env.MKEYS,stdTTL:process.env.STDTTL});

// whem ttl expired this callback called
newCache.on("expired",function(key,value){
    newCache.del( key);
});

newCache.on("del",(key,value)=>{
    delFunction(key,value,express.response);
})

var forward = false;

//Read/create a key

export const getCachedDataByKey = (req,res) =>{
    
    const { key }  = req.params;

    const catchData = newCache.get( key )
    if(catchData == undefined ){

        console.log('Cache Miss');

        const currentKeysCount = newCache.keys().length;

        if(checkMaxLimit(currentKeysCount)){
            const oldKey = newCache.keys()[0];
            newCache.del(oldKey);
        }
        const randomStr = Randomstring.generate();

        const success = newCache.set(randomStr,{},process.env.STDTTL);

        createFunction(randomStr,{},res);

        if(forward){
            let obj ={ body:{ key:randomStr,data:req.params.data } }
            createData(obj,res);
        }
        if(success) return res.json(randomStr);
    }
    else{
        newCache.del(key)
        newCache.set(key,catchData,process.env.STDTTL);
        console.log("Cache Hit");
        return res.json(catchData);
    }
}

// Get All the keys

export const getAllKeys = (req,res) =>{
    const keys = newCache.keys();
    if(keys) return res.json(keys);
}
// create new data for existing key

export const createData = (req,res) =>{
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
        success = newCache.set(key,data,process.env.STDTTL);
        updateFunction(key,data,res);
    }
    if(success) return res.json({'data':data})
    
}
// update data for a parameter key
export const updateDataByKey = (req,res) =>{
    const { key } = req.params;
    const { data } = req.body;

    if(!newCache.get(key)) return res.json({'message':'key doesnot exist'})
    const success = newCache.set(key,data,process.env.STDTTL);
    updateFunction(key,data,res);
    if(success) return res.json({'data':data }); 
    
}

//Remove a single key,value

export const removeKey = (req,res) =>{

    const { key } = req.params;

    if(!newCache.get(key)) return res.json({'message':'key doesnot exist'})
    
    const result = newCache.del( key );

    if(result) return res.json({"message":"key removed"});
    
}

//Remove all the key value data

export const removeAllKeys = (req,res) =>{
    if(newCache.keys().length <= 0) return res.json([])
    deleteAllFunction(res);
    newCache.flushAll();
    res.json(newCache.keys());
    
}