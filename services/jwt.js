var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'secret_key';


exports.createToken = function (user){
    var payload = {
        sub:user.id,
        name:user.name,
        role:user.role,
        status:user.status,
        image:user.image,
        iat:moment.unix(),
        exp:moment().add(1,'days').unix()

    }
    return jwt.encode(payload, secret);
}