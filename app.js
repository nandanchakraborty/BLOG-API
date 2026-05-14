require('dotenv').config();
const express = require('express');
const UserRouter = require('./server/route/userHandler')
const AdminRouter = require('./server/route/adminHandler')
const PostRouter = require('./server/route/postHandler')

const cookieParser = require('cookie-parser')
const app = express();

const PORT = 3000 || process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use('/user',UserRouter);
app.use('/admin',AdminRouter);
app.use('/post',PostRouter);

app.use(express.static('public'));
 app.get('/',(req,res)=>{
    res.json({message :' hello'})
 })
app.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT}`);
})