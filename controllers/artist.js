const conn = require('mysql2');
var jwt = require("../services/jwt");
var fs = require('fs'); //MANEJO DE ARCHIVOS
var path = require('path'); //RUTAS o UBICACIONES

const conexion = conn.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb'
});

module.exports={
    save(req, res){
        data = req.body;
        name = data.name;
        description = data.description;
        user = req.user;
        sql = '';
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            sql = 'INSERT INTO artist (name,description) VALUES("'+name+'","'+description+'")'
            conexion.query(sql,function(err,results,fields){
                if(err){
                    console.log(err)
                    res.status(200).send({message: "No se pudieron Guardar tus datos"});
                }else{
                    console.log(results)
                    res.status(201).send({message: "Datos guardados de manera correcta"});
                }
    
            })
            
        }else{
            res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }


    },
    list(req, res){
        conexion.query("SELECT * FROM artist", 
        function(err, results, fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw artists'}))

        })
    },
    lisbyid(req,res){
        user = req.user;
        id = req.params.id;
        sql = 'SELECT  * FROM artist WHERE id = '+id;

        conexion.query(sql,function(err,results,fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw user'}))
        })
    },
    delete(req,res){
        id = req.params.id;
        user = req.user;
        sql = '';
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            conexion.query("DELETE FROM song WHERE album_id IN(SELECT id FROM album WHERE artist_id = ?)",[id],
            function(err, results){
                if(!results){
                    console.log(err)
                    res.status(404).send({message:"Canción no encontrada"})
                }
                conexion.query("DELETE FROM album WHERE artist_id = ?",[id],
                function(err,results,fields){
                    if(err){
                        console.log(err)
                        res.status(400).send({message:'El Album no existe'})
                    }
                    conexion.query("DELETE FROM artist WHERE id = ?",[id],
                    function(err,results,fields){
                        if(!err){
                            if(results.affectedRows != 0){
                                console.log(results)
                                res.status(200).send({message:"Se elimino la Canción y el Album y Canciones"})
                            }else{
                                res.status(404).send({message:"Registro inexistente"})
                            }
                        }else{
                            console.log(err)
                            res.status(404).send({message:"No se pudo ejecutar tu consulta"})
                        }
        
                    });
                }); 
            })            
        }else{
            res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }

    },
  update(req,res){
        id = req.params.id
        data = req.body;
        user = req.user
        sql = '';
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            sql = 'UPDATE artist SET ? WHERE id = '+id

            conexion.query(sql, [data], 
                function(err,results,fields){
                    if(!err){
                        console.log(results);
                        res.status(200).send({message: 'Datos actualizados'})
                    }else{
                        console.log(err);
                        res.status(200).send({message: 'No se pudo actualizar'})
                    }
                });      
        }else{
            res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }

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
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            if(req.files){
                sql = 'UPDATE artist SET image ="'+file_name+'" WHERE id = "'+id+'"'
                if(file_ext=='jpg' || file_ext == 'gif' || file_ext == 'png' || file_ext=='jpeg'){
                    conexion.query(sql,function(err,results,fields){
                        if(!err){
                            if(results.affectedRows !=0){
                                console.log(sql)
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
            
        }else{
            res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }
        console.log(req.files);



    },
    getImage(req,res){
        var image = req.params.image;
        var path_file = './uploads/artists/'+image;
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
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            sql = 'SELECT image from artist WHERE id = '+id;
            update = "UPDATE artist SET image = NULL WHERE id = "+id
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
            
        }else{
                res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }
    }
}