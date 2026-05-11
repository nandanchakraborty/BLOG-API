const jwt = require('jsonwebtoken');
const authMiddleware = (req,res,next)=>{
    const {authorization} = req.headers;
  
    try{
        const token = authorization.split(' ')[1];
        const decode = jwt.verify(token,process.env.JWT_SECRET);
         const {username,id} = decode;
         req.username = username;
         req.id= id;

        next()
    }catch(err){
        console.log(err);
        next('authentication failed');

    }
}

module.exports = authMiddleware ;