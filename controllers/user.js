var brcypt = require('bcrypt-nodejs');
const conn = require('mysql2');
var jwt = require("../services/jwt");
var fs = require('fs'); //MANEJO DE ARCHIVOS
var path = require('path'); //RUTAS o UBICACIONES
const { error } = require('console');


const conexion = conn.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb'
});

module.exports={
    save(req, res){
        console.log(req.body);
        data = req.body;
        name = data.name;
        username = data.username;
        email = data.email;

        if(data.password != '' && data.password != null){
            brcypt.hash(data.password, null, null,function(err, hash){
                if (err){
                    console.log(err);
                    res.status(500).send({message: "Error al encriptar"})
                }else{
                    password = hash;
                    conexion.query(
                        'INSERT INTO user(name, username, password, email) VALUE("'+name+'", "'+username+'", "'+password+'", "'+email+'")', 
                        function(err, results, fields){
                            if (err){
                                console.log(err)
                                res.status(200).send({message:'Error, Intente de nuevo'})
                            }else{
                                res.status(201).send({message: 'Datos Guardados correctamente'})
                            }
                        }
                    );
                }
            })
        }else{
            res.status(200).send({message: "Por favor llena todos los campos"})

        }


    },
    myporfile(req,res){
        user = req.user;
        sql = '';
            sql = 'SELECT * FROM user WHERE id ='+id
        conexion.query(sql, 
        function(err, results, fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw users'}))

        })
    },
    list(req, res){
        user = req.user;
        sql = '';
        if(user.role == 'admin'){
            // Mostrar todo
            sql = 'SELECT * FROM user'
            
        }else{
            sql = 'SELECT * FROM user WHERE id ='+user.sub
        }
        conexion.query(sql, 
        function(err, results, fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw users'}))

        })
    },
    lisbyid(req,res){
        user = req.user;
        id = user.sub;
        sql = 'SELECT  * FROM user WHERE id = '+id;

        conexion.query(sql,function(err,results,fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw user'}))
        })
    },
    listbyUser(req, res){
        user = req.user;
        sql = '';
        id =  req.params.id;
            // Mostrar todo
            sql = 'SELECT * FROM user WHERE id ='+id

        conexion.query(sql, 
        function(err, results, fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw users'}))

        })
    },
    login(req, res){
        var data = req.body;
        var username = data.username;
        var password = data.password;
        var token  = data.token;
        var role = data.role;
        user = req.user
        conexion.query('SELECT * FROM user WHERE username = "'+username+'" LIMIT 1',
        function(err, results,fields){
            console.log(results)
            if(results.length != 0){
                if(!err){
                    brcypt.compare(password,results[0].password,function(err,check){
                        if(check){
                            if(token){
                                res.status(200).send(
                                    {token:jwt.createToken(results[0]),
                                    role:results[0].role}
                                )
                                // const userWithRole = {...results[0], role: 'el_rol_del_usuario'}; // Reemplaza 'el_rol_del_usuario' con el rol real del usuario
                                // res.status(200).send({
                                //     token: jwt.createToken(userWithRole),
                                //     role: userWithRole.role // También puedes enviar el rol por separado si es necesario
                                // });


                            }else{
                                res.status(200).send({message:'Datos Correctos'});
                            }
                        }else{
                            res.status(200).send({message: 'Usuario y/o Contraseña Incorrecto'})
                        }
                    })
                }else{
                    console.log(err);
                    res.status(500).send({message: "Intentalo más tarde"})
                }

            }else{
                res.status(200).send({message:'Usuario y/o Contraseña Incorrecto'})
            }

        }
        );
    },
    delete(req,res){
        id = req.params.id;
        user = req.user
        sql = '';
        
        if(user.role == 'admin'){
            // Mostrar todo
            sql = 'DELETE FROM user WHERE id ='+id
            
        }else{
            sql = 'DELETE FROM user WHERE id = '+user.sub
        }
        conexion.query(sql ,function(err, results, fields){
            if(!err){
                if(results.affectedRows != 0){
                    res.status(200).send({message: "Registro eliminado"})
                }else{
                    res.status(200).send({message: "No se pudo eliminar nada"})
                }
            }else{
                console.log(err);
                res.status(500).send({message: "Intentalo más tarde"})
            }
        })
    },
    update(req,res){
        id = req.params.id
        data = req.body;
        user = req.user
        sql = '';
        if(user.role == 'admin'){
            // Mostrar todo
            sql = 'UPDATE user SET ? WHERE id = '+id
            
        }else{
            if(user.sub != id){
                res.status(200).send({message: 'No tienes permisos para hacer esto'})
            }else{
                sql = 'UPDATE user SET ? WHERE id = '+user.sub

            }
        }
        if(data.password){
            brcypt.hash(data.password, null,null,function(err,hash){
                if(!err){
                    data.password= hash;

                }
            });
        }
            conexion.query(sql,data, 
                function(err,results,fields){
                    console.log([data])
                    if(!err){
                        console.log(results);
                        res.status(200).send({message: 'Datos actualizados'})
                    }else{
                        console.log(err);
                        res.status(200).send({message: 'No se pudo actualizar'})
                    }
                });
    },

    uploadImage(req,res){
        var id = req.params.id;
        var file = 'Sin Imagen...'
        user = req.user
        sql = '';
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext = file_name.split('\.');
        var file_ext = ext[1];
        if(user.role == 'admin'){
            // Mostrar todo
            sql = 'UPDATE user SET image ="'+file_name+'" WHERE id = "'+id+'"'
            
        }else{
            if(user.sub != id){
                res.status(200).send({message: 'No tienes permisos para hacer esto'})
            }else{
                sql = 'UPDATE user SET image ="'+file_name+'" WHERE id = '+user.sub
            }


        }
        console.log(req.files);
        if(req.files){
            if(file_ext=='jpg' || file_ext == 'gif' || file_ext == 'png' || file_ext=='jpeg'){
                conexion.query(sql,function(err,results,fields){
                    if(!err){
                        if(results.affectedRows !=0){
                            res.status(200).send({message: 'Imagen actualizada'})
                        }else{
                            res.statuts(200).send({message: 'Error al actualizar'})
                        }
                    }else{
                        console.log(err);
                        res.status(200).send({message: 'Intentalo más tarde'})
                    }
                })
            }else{
                res.status(200).send({message: 'Imagen no valida'})
            }
        }


    },
    getImage(req,res){
        var image = req.params.image;
        var path_file = './uploads/users/'+image;
        console.log(path_file)

        if(fs.existsSync(path_file)){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message: 'No existe el archivo'})
        }
    },
    delImage(req,res){
        id = req.params.id;
        user = req.user;
        if(user.role == 'admin'){
            // Mostrar todo
            sql = 'SELECT image from user WHERE id = '+id;
            update = "UPDATE user SET image = NULL WHERE id = "+id
            
        }else{
            if(user.sub != id){
                res.status(200).send({message: 'No tienes permisos para hacer esto'})
            }else{
                sql = 'SELECT image from user WHERE id = '+user.sub;
                update = "UPDATE user SET image = NULL WHERE id = "+user.sub
            }
        }
        conexion.query(sql,function(err,results,fields){
            if (!err) {
                //Eliminar la imagen fisica
                if(results[0].image !=null){
                    var path_file = './uploads/users/'+results[0].image;
                    try{
                        fs.unlinkSync(path_file);
                        conexion.query(update, function(err, results){
                            if(err){
                                console.log(err);
                                res.status(200).send({message: 'Consulta no valida'})
                            }else{
                                res.status(200).send({message: 'Imagen Borrada correctamente'})
                            }
                        });
                    }catch{
                        console.log(error)
                        res.status(200).send({message: 'No se pudo eliminar'})
                    }

                }else{
                    res.status(404).send({message:'No hay registro de esta imagen'})
                }
            
            }else{
                console.log(err)
                res.status(500).send({message: 'Intenta más tarde'})
            }
        });
    }
}

