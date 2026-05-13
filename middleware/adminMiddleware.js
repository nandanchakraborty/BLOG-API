const jwt = require('jsonwebtoken');
const adminMiddleware = (req,res,next)=>{
    const {authorization} = req.headers;
  
    try{
        const token = authorization.split(' ')[1];
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        
        const {role,id} = decode;
        if(role === 'admin'){
         req.role = role;
         req.id= id;

        next()
        }
        else{
            next('authentication failed');
        }
    }catch(err){
        console.log(err);
        next('authentication failed');

    }
}

module.exports = adminMiddleware ;