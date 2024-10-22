const express = require("express");
const {open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

const dbPath = path.join(__dirname,"transitions.db");

app.use(express.json());

let db = null;

const intializeServer = async()=>{
    try{
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database,
        });
        app.listen(4005,()=>{
            console.log("Server Started")
        })
    }catch(e){
        console.log(`Db error:${e.message}`);
        process.exit(1);
    }
}

app.post("/transactions",async(req,res)=>{
    try {
        const {type,category,amount,date,description} = req.body
        const setTransitionQuery = `
        INSERT INTO transactions(type,category,amount,date,description)
        VALUES('${type}','${category}','${amount}','${date}','${description}');`;
        const setTransition = await db.run(setTransitionQuery)
        res.send("sucess")
    } catch (e) {
        res.send(e.message)
    }
})

app.get("/transactions",async(req,res)=>{
    try {
        const getTransitionQuery =  `SELECT *
        FROM transactions`
        const data = await db.all(getTransitionQuery)
        res.send(data)
    } catch (e) {
        res.send(e.message)
    }
})

app.get("/transactions/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const getSelectedTransactionQuery = `SELECT *
        FROM transactions WHERE id = '${id}';`;
        const data = await db.get(getSelectedTransactionQuery)
        res.send(data)
    } catch (error) {
        res.send(error.message)
    }
})


app.put("/transactions/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const {category} = req.body
        const updateQuery = `
        UPDATE transactions 
        SET category = '${category}'
        WHERE id = '${id}';`;
        const response = await db.run(updateQuery);
        res.send("Updated Successfully");
    } catch (error) {
        res.send(error.message)
    }
})

app.delete("/transactions/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const deleteQuery =`DELETE FROM transactions
        WHERE id = '${id}';`;
        const response = await db.run(deleteQuery);
        res.send("Successfully Deleted")
    } catch (error) {
        res.send(error.message)
    }
})

app.get("/summary",async(req,res)=>{
    try {
        const getAllTransactionsQ = `SELECT *
        FROM transactions`
        const data = await db.all(getAllTransactionsQ)
        let totalIncome = 0
        let totalExpense = 0
        for (let i=0;i<data.length;i++){
            if((data[i].type)==="income"){
                totalIncome = totalIncome + data[i].amount
            }else if((data[i].type)==="expense"){
                totalExpense = totalExpense + data[i].amount
            }
        }
        const balance = totalIncome - totalExpense
        const result = {totalIncome,totalExpense,balance}
        res.send(result)
    } catch (error) {
        res.send(error.message)
    }
})

intializeServer()