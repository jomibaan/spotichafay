const express = require('express')
const app = express()
const logger = require('morgan');
const conn = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
require ('dotenv').config(); //BUSCA QUE EXISTA UN ARCHIVO .ENV
const PORT = process.env.PORT;
// Connect to database


const conexion = conn.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

// Rutas de User
var user_routes = require('./routes/user');
app.use(user_routes);
// Rutas de Artista
var artist_routes = require('./routes/artist');
app.use(artist_routes);
// Ruta de Albumes
var album_routes = require('./routes/album');
app.use(album_routes);
// Ruta de Canciones
var song_routes = require('./routes/song');
app.use(song_routes);
app.get('*', (req, res) =>{
    res.send('Página no encontrada, revise la ruta')
})

// Realizamos una verificiacion de que si no se conecta a la base de datos no inicie el servidor
conexion.connect((error)=>{
    if(error){
        console.log('No pudiste establecer conexion a la base de datos');
    }
    else{
        console.log('Conexión establecida correctamente');

    }
});
app.listen(PORT, ()=>{
    console.log(`El Servidor esta corriendo en el puerto: http://localhost:${PORT}`)
})