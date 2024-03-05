// const { duration } = require('moment');
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
        number = data.number;
        name = data.name;
        duration = data.duration;
        album_id = data.album_id;
        user = req.user;
        sql = '';
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            sql ='INSERT INTO song (number,name,duration,album_id) VALUES("'+number+'","'+name+'","'+duration+'","'+album_id+'")';
            conexion.query(sql,function(err,results,fields){
                if(err){
                    console.log(err)
                    res.status(200).send({message: "No se pudieron Guardar tus datos"});
                }else{
                    console.log(results)
                    res.status(201).send({message: "Cancion Guardada de manera correcta"});
                }
    
            }) 
            
        }else{
            res.status(200).send({message: 'No tienes permisos para hacer esto'})
        }

        
    },
    list(req, res){
        conexion.query("SELECT * FROM song", 
        function(err, results, fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw songs'}))

        })
    },
    lisbyid(req,res){
        user = req.user;
        id = req.params.id;
        sql = 'SELECT * FROM song WHERE id = '+id;

        conexion.query(sql,function(err,results,fields){
            if(results){
                res.status(200).send({data: results})
            }
            else(res.status(500).send({message: 'Error to throw user'}))
        })
    },
    listbyalbum(req,res){
        user = req.user;
        id = req.params.id;
        sql = 'SELECT * FROM song WHERE album_id ='+id;

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
            conexion.query('DELETE FROM song WHERE id ='+id, function(err, results, fields){
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
            sql = 'UPDATE song SET ? WHERE id = '+id

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
        var file_path = req.files.file.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext = file_name.split('\.');
        var file_ext = ext[1];
        if(user.role == 'admin' || user.role== 'creator'){
            // Mostrar todo
            sql = 'UPDATE song SET file ="'+file_name+'" WHERE id = "'+id+'"'
            if(req.files){
                if(file_ext=='mp3' || file_ext == 'mp4'){
                    conexion.query(sql,function(err,results,fields){
                        if(!err){
                            if(results.affectedRows !=0){
                                res.status(200).send({message: 'Canción actualizada'})
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
        console.log(req.params)
        var image = req.params.song;
        var path_file = './uploads/songs/'+image;
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
            sql = 'SELECT file from song WHERE id = '+id;
            update = "UPDATE song SET file = NULL WHERE id = "+id
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