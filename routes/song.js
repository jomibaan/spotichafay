var express = require('express')
var api = express.Router();
var userController = require('../controllers/song');
var multipart = require('connect-multiparty');
var md_upload =multipart({uploadDir: 'uploads/songs'})
var md_auth = require('../middlewares/authenticated');

api.get('/songs',userController.list);
api.delete('/songs/:id',[md_auth.Auth],userController.delete)
api.get('/songs/details/:id',userController.listbyalbum);
api.get('/songs/:id',[md_auth.Auth],userController.lisbyid);
api.put('/songs/:id',[md_auth.Auth],userController.update);
api.post('/songs',[md_auth.Auth],userController.save);
api.post('/songs/song/:id',[md_auth.Auth,md_upload],userController.uploadImage);
api.get('/songs/song/:song',userController.getImage);
api.delete('/song/song/:id',[md_auth.Auth],userController.delImage);



module.exports = api;

