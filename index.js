import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import catcheRoutes from './routers/cache.js';

const app = express();

dotenv.config({path:'./config/.env'});
app.use(bodyParser.json({ limit : "30mb",extended : true}));
app.use(bodyParser.urlencoded({ limit : "30mb",extended : true}));

app.use(cors());

app.use('/caches',catcheRoutes);

app.get('/',(req,res)=>{
    res.send("catch api");
});

mongoose.connect(process.env.CONNECTION_URL,{
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(()=>console.log("db connected"))
.catch(err => console.log(err));

const PORT = 5000;

app.listen(PORT,()=>console.log(`server running on port ${PORT}`));