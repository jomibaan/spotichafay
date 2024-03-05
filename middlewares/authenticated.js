var jwt = require("jwt-simple");
var moment = require('moment');
var secret = 'secret_key';

exports.Auth = function(req,res,next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'Falta llave de autorización'})
    }
    var token = req.headers.authorization.replace(/[""]+/g, '');
    try{
        var payload = jwt.decode(token,secret);
        if(payload.exp <=moment().unix()){
            return res.status(401).send({message: 'Sesion Caducada'})

        }
    }catch(error){
        console.log(error);
        return res.status(404).send({messag: 'Llave no valida'})
    }
    req.user=payload;
    next();

}