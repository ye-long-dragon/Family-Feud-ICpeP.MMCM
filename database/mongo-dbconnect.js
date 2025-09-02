import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default async function connect(){
    const database = process.env.db_user;
    if(!database){
        throw new Error("Database connection string is not defined");
    }
    mongoose
    .connect(database,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        dbName:'MainDatabase',
    })
    .then(()=>{
        console.log("Connected to database");
    })
    .catch((error)=>{
        console.log(error);
    })

}