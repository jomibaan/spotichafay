const conn = require('mysql2');
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
        title = data.title;
        description = data.description;
        year = data.year;
        artist_id = data.artist_id;
        user = req.user;
        sql = '';
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            sql ='INSERT INTO album (title,description,year,artist_id) VALUES("'+title+'","'+description+'","'+year+'","'+artist_id+'")';
            conexion.query(sql,function(err,results,fields){
                if(err){
                    console.log(err)
                    res.status(200).send({message: "No se pudieron Guardar tus datos"});
                }else{
                    console.log(results)
                    res.status(201).send({message: "Album Guardado de manera correcta"});
                }
    
            }) 
            
        }else{
            res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }

    },
    list(req, res){
        conexion.query("SELECT * FROM album", 
        function(err, results, fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw albums'}))

        })

    },
    lisbyid(req,res){
        user = req.user;
        id = req.params.id;
        sql = 'SELECT * FROM album WHERE id = '+id;

        conexion.query(sql,function(err,results,fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw user'}))
        })
    },
    listbyartist(req,res){
        user = req.user;
        id = req.params.id;
        sql = 'SELECT * FROM album WHERE artist_id ='+id;

        conexion.query(sql,function(err,results,fields){
            if(results){
                res.status(200).send({data: results});
                console.log(results)
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

            conexion.query("DELETE FROM song WHERE album_id = ?",[id],
            function(err,results,fields){
                if(err){
                    console.log(results)
                    console.log(err)
                    res.status(400).send({message:'La cancion no ha sido eliminada'})
                }
                conexion.query("DELETE FROM album WHERE id = ?",[id],
                function(err,results,fields){
                    if(!err){
                        if(results.affectedRows != 0){
                            console.log(results)
                            res.status(200).send({message:"Se elimino el Album y Canciones"})
                        }else{
                            res.status(404).send({message:"El Album no existe"})
                        }
                    }else{
                        console.log(err)
                        res.status(404).send({message:"No se pudo ejecutar tu consulta"})
                    }
    
                });
            });            
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
            sql = 'UPDATE album SET ? WHERE id = '+id

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
            sql = 'UPDATE album SET image ="'+file_name+'" WHERE id = "'+id+'"'
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
            
        }else{
            res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }
        console.log(req.files);



    },
    getImage(req,res){
        var image = req.params.image;
        var path_file = './uploads/albums/'+image;
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
            sql = 'SELECT image from album WHERE id = '+id;
            update = "UPDATE album SET image = NULL WHERE id = "+id
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