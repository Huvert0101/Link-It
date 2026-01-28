import path from 'path'
import fs from 'fs'
import axios from 'axios';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express'
import compression from 'compression';
import { conn } from './db.js'
import FormData from 'form-data';
const app = express();
//settings
app.use(cors());

app.use(compression({
    brotli: {enabled: true, zlib: {}}
}));
app.set('port', process.env.PORT || 3000);
//static files;
const {json} = bodyParser;
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
var jsonParser = bodyParser.json({ limit: '50000mb' })

const storage = multer.diskStorage({
    destination: 'public/files/',
    filename: function(req, file, cb){
        cb("", file.originalname);
    }
});
//const upload = multer({limits: { fileSize: 5 * 1024 * 1024 * 1024 }, storage: storage })
const upload = multer({ storage: multer.memoryStorage() });
// SQL
async function insertMessage(message, type, user, folder){
    const sql = "INSERT INTO messages(message, type, user, folder) VALUES(?, ?, ?, ?)";
    const values = [message, type, user, folder];
    try {
        await conn.query(sql, values);
    } catch (err) {
        console.error("Error al insertar:", err);
    }
}
async function insertBg(user, bg_src){
    await conn.query("INSERT INTO backgrounds(user,bg_src) VALUES('"+ user +"', '"+bg_src +"')");
}
async function Register(user, paswd){
    const [res] = await conn.query("INSERT INTO users(user, password) VALUES('" + user + "', '" + paswd + "')");
    return res;
}
async function Login(usr, pswd){
    const [res] = await conn.query("SELECT * FROM users WHERE user = '" + usr + "' AND password = '" + pswd + "'");
    return res;
}
async function validRegister(usr, pswd){
    try {
     const [res] = await conn.query("SELECT * FROM users WHERE user = '" + usr + "'");
     return res;   
    } catch (error) {
     console.log("Errrror:" + error)   
     return
    }
}
async function createFolder(usr, folderName){
    const [length] = await conn.query("SELECT * FROM folders WHERE user = '" + usr + "' AND folder = '" + folderName + "'");
    if(length.length > 0) return false
    const [res] = await conn.query("INSERT INTO folders(user, folder) VALUES('"+usr+"', '"+folderName+"')");
    return res;
}
async function delFol(usr, folderName){
    const [res] = await conn.query("DELETE FROM folders WHERE user ='" + usr + "' AND folder ='" + folderName + "'");
    //delete the messages form that folder as well
    const [res2] = await conn.query("DELETE FROM messages WHERE user ='" + usr + "' AND folder ='" + folderName + "'");
    if(res && res2) return "200";
    else return "500";
}
async function delMessage(usr, folderName,  msg){
    const [res2] = await conn.query("DELETE FROM messages WHERE message='" + msg+ "' AND user ='" + usr + "' AND folder ='" + folderName + "'");
    if(res2) return "200";
    else return "500";
}
async function validUser(usr){
    const [res] = await conn.query("SELECT user FROM users WHERE user ='"+usr+"'");
    if(res.length > 0) return true;
    else return false;
}

function getMp3Files(musicFolder) {
    return new Promise((resolve, reject) => {
        fs.readdir(musicFolder, (err, files) => {
            if (err) {
                reject(`Error al leer la carpeta: ${err}`);
                return;
            }
            // Filtra los archivos para quedarse solo con los .mp3
            const mp3Files = files.filter(file =>{
                const extension = path.extname(file).toLowerCase();
                return extension === '.mp3' || extension === '.flac';
            });
            resolve(mp3Files);
        });
    });
}
async function getBackgrounds(user){
    const [res] = await conn.query("SELECT bg_src from backgrounds WHERE user = '"+user+"'");
    return res;
}
async function getCurrentBg(user){
    const [res] = await conn.query("SELECT bg_src from backgrounds WHERE user ='"+user+"' AND active=1");
    return res;
}
async function changeCurrentBg(user, bg){
    const [res] = await conn.query("UPDATE backgrounds SET active=0 WHERE user ='"+user+"' AND active=1");
    const [res2] = await conn.query("UPDATE backgrounds SET active=1 WHERE user ='"+user+"' AND bg_src='"+bg+"'");
    return res, res2;
}

// Routes
app.get('/welcome', (req, res)=>{
    let username = req.cookies.username;
    let password = req.cookies.password;
    if(username != undefined && password != undefined) res.sendFile(path.join(__dirname, "public", "index.html"));
    else res.sendFile(path.join(__dirname, "public", "welcome.html"));
});

app.post('/login', (req, res)=>{
    const login = req.body.chosed_login;
    const username = req.body.username;
    const password = req.body.password;
    const newUser = username.trim();
    const newPassword = password.trim();
    if(login == undefined){
        validRegister(newUser, newPassword).then(result =>{
            if(result.length > 0){
                res.send("Usuario ya existe use otro usuario");
            }else{
                Register(newUser, newPassword).then(result => {
                    if(result){
                        res.cookie("username", newUser,{maxAge: 1500000000});
                        res.cookie("password", newPassword, {maxAge: 1500000000});
                        res.redirect("/");
                    }
                });
            }
        });
    }else{
        Login(newUser, newPassword).then(result =>{
            if(result.length < 1) res.send("Usuario no encontrado intente con otras credenciales");
            if(newUser == result[0].user && newPassword == result[0].password){
                res.cookie("username", newUser,{maxAge: 1500000000});
                res.cookie("password", newPassword, {maxAge: 1500000000});
                res.redirect("/");
            }else
                res.send("User or password are incorrect");
        });
    }
});
async function getFoldersFriends(user){
    const [res] = await conn.query("SELECT * FROM folders WHERE user = '"+user+"' AND folder LIKE 'friend%'");
    return res;
}
app.get('/logout', (req, res)=>{
    res.clearCookie("username");
    res.clearCookie("password");
    res.redirect("/");
});
app.post('/delFol', jsonParser, (req, res)=>{
    const folName = req.body.folderName;
    const user = req.body.user;
    delFol(user, folName).then(res2 =>{
        if(res2 == 200){
            res.sendStatus(200);
        }else{
            res.sendStatus(500);
        }
    })
});
app.post('/delMessage', jsonParser, (req,res)=>  {
    const folName = req.body.folderName;
    const user = req.body.user;
    const msg = req.body.msg;
    delMessage(user, folName, msg).then(res2 =>{
        if(res2 == 200){
            res.sendStatus(200);
        }else{
            res.sendStatus(500);
        }
    })
})
app.get('/api/files/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const targetUrl = `http://linkit1.duckdns.org/files/${filename}`; // Ruta en tu Flask
        const response = await axios({
            method: 'get',
            url: targetUrl,
            responseType: 'arraybuffer' // Importante para no saturar la RAM
        });
        // Pasamos los headers de tipo de archivo (image/png, video/mp4, etc.)
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Content-Length', response.headers['content-length']);
        res.send(response.data);
    } catch (error) {
        console.error('Error al visualizar archivo:', error.message);
        res.status(404).send('Archivo no encontrado o servidor local offline.');
    }
});
app.get('/getMusic', async (req, res) => {
    //const musicPath = path.join(__dirname, 'public', 'files');
    //try {
    //    const mp3Files = await getMp3Files(musicPath);
    //    res.json(mp3Files);
    //} catch (err) {
    //    res.status(500).json({ error: err });
    //}
    const flaskUrl = 'http://linkit1.duckdns.org/getMusic';
    try {
        const response = await axios.get(flaskUrl);
        const songUrls = response.data.map(fileName => `${fileName}`);
        res.json(songUrls);
    } catch (err) {
        console.error('Error al obtener música:', err.message);
        res.status(500).json([]); // Devolvemos lista vacía en caso de error para no romper el JS del cliente
    }
});
app.post('/addfriend', jsonParser, async(req, res) => {
   let friend = req.body.friendUser;
   let user = req.body.user;
   let folderName = 'friend'+user+friend;
   const exists = await validUser(friend);
   console.log(exists);
   if(exists){
    createFolder(user,folderName);
    createFolder(friend,folderName);
    console.log(await getFoldersFriends(user));
    res.json({folderName: folderName})
   }else{
    res.sendStatus(404);
   }
})
app.post('/getFriends',jsonParser, async(req,res) => {
    console.log(req.body.user);
    console.log(await getFoldersFriends(req.body.user));
    res.json(await getFoldersFriends(req.body.user));
})
// Extension Routes
app.post('/test',jsonParser, (req, res)=>{
    console.log("request")
    const username = req.body.username;
    const paswd = req.body.password;
    const chosed_login = req.body.chosed_login;
    const java = req.body.java;
    console.log(typeof java, java)
    const newUser = username.trim();
    const newPswd = paswd.trim();
    console.log({username, paswd, chosed_login})
     res.set({
        "Access-Control-Allow-Origin": "*",
    });
    if(chosed_login == true){
        Login(newUser, newPswd).then(result =>{
            if(result.length < 1){
                res.sendStatus(404); //usuario no encontrado
            }
            if(newUser == result[0].user && newPswd == result[0].password){
                res.cookie("username", newUser,{maxAge: 1500000000});
                res.cookie("password", newPswd, {maxAge: 1500000000});
                if(java == undefined){
                    res.sendStatus(200);
                }else{
                    res.send(JSON.stringify({status:200}))
                }
            }else{
                res.sendStatus(400); // user or pswd incorrect
            }
        });
    }else{
        validRegister(newUser, newPswd).then(result =>{
            if(result.length > 0){
                res.sendStatus(201);// Usuario ya existe
            }else{
                Register(newUser, newPswd).then(result => {
                    if(result){
                        res.cookie("username", newUser,{maxAge: 1500000000});
                        res.cookie("password", newPswd, {maxAge: 1500000000});
                        res.sendStatus(200);
                    }
                });
            }
        });
    }
});
app.use((req, res, next) => {
  res.header("Access-Control-Expose-Headers", "Content-Disposition");
  next();
});
app.get('/downloadYtMusic', async(req,res)=> {
    const { videoUrl } = req.query;
    console.log(videoUrl);
    const flaskUrl = `http://linkit1.duckdns.org/download-yt-music?url=${encodeURIComponent(videoUrl)}`;
    try {
        const response = await axios({
            method: 'get',
            url: flaskUrl,
            responseType: 'stream'
        });
        let fileName = response.headers['x-file-name'] || 'music.mp3';
        const safeFileName = encodeURIComponent(fileName);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${safeFileName}`);
        res.setHeader('Content-Type', 'audio/mpeg');
        console.log(safeFileName)
        response.data.pipe(res);
    } catch (err) {
        console.error('Error al descargar:', err.message);
        res.status(500).send('Error en el servidor de descarga local.');
    }
});
//start the server
const server = app.listen(app.get('port'), ()=> {
    console.log('Server on port', app.get('port'));
});
import {Server} from 'socket.io'
const io = new Server(server);
app.post('/upload', upload.single('file'), async function(req, res, next){
    insertMessage('files/' + req.file.originalname, "file", req.body.user, req.body.folder);
    io.sockets.emit('getFiles', {
        message: 'files/' + req.file.originalname,
        type: 'file',
        user: req.body.user,
        folder:req.body.folder
    });
    try {
        if (!req.file) {
            return res.status(400).send('No se subió ningún archivo.');
        }
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        console.log('Reenviando archivo a MX Linux...');
        const response = await axios.post('http://linkit1.duckdns.org/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error en el proxy:', error.message);
        res.status(500).send('Error al reenviar el archivo al servidor remoto.');
    }
});
app.post('/uploadBg', upload.single('bg_src'), async function(req, res, next){
    insertBg(req.body.user, 'files/' + req.file.originalname);
    try {
        if (!req.file) {
            return res.status(400).send('No se subió ningún archivo.');
        }
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        console.log('Reenviando archivo a MX Linux...');
        const response = await axios.post('http://linkit1.duckdns.org/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error en el proxy:', error.message);
        res.status(500).send('Error al reenviar el archivo al servidor remoto.');
    }
})
app.post('/getBackgrounds',jsonParser,async(req, res) => {
    console.log(req.body.user);
    res.json(await getBackgrounds(req.body.user))
});
app.post('/getCurrentBg',jsonParser, async(req, res) => {
    console.log("Obteniendo background activo para usuario:",req.body.user);
    res.json(await getCurrentBg(req.body.user));
});
app.put('/changeCurrentBg', jsonParser, async(req,res) => {
    res.json(await changeCurrentBg(req.body.user, req.body.bg_src));
});
async function getMessages(user, folder){//maybe parameter: folder
    const [res] = await conn.query("SELECT * FROM messages WHERE user = '"+user+"' AND folder = '"+folder+"' ORDER BY id DESC LIMIT 13");
    io.sockets.emit('getMessages', res);
}
async function getMessagesFol(user, folder){//maybe parameter: folder
    console.log("Folder al clickear back:",folder);
    console.log("usuario al clickar back:",user);
    if(user == ''){
        const [res] = await conn.query("SELECT * FROM messages WHERE folder = '"+folder+"'");
        io.sockets.emit('getMessagesFol', res);
    }else{
        const [res] = await conn.query("SELECT * FROM messages WHERE user = '"+user+"' AND folder = '"+folder+"'");
        if (!res || res.length === 0) {
            io.sockets.emit('getMessagesFol', { user: user, folder:folder });
        } else {
            io.sockets.emit('getMessagesFol', res);
        }
    }
}
async function getFolderFilesFromCloud(user, folder){
    const [res] = await conn.query("SELECT * FROM messages WHERE user = '"+user+"' AND folder = '"+folder+"' AND type='file'");
    return res
}
async function getFolders(user){
    const [res] = await conn.query("SELECT * FROM folders WHERE user = '"+user+"' AND folder NOT LIKE 'friend%'");
    return res;
}
app.post('/getFolderFilesFromCloud', jsonParser, async(req,res)=>{
    console.log(req.body);
    const filesFromCloud = await getFolderFilesFromCloud(req.body.user, req.body.folder);
    console.log(filesFromCloud);
    res.json(filesFromCloud)
})
//websockets
let connectedUsers = 0;
let activeUsersList = [];
io.on('connection', (socket) => {
    console.log("Socket connected!")
    socket.on('getUser', (user)=>{
        connectedUsers++;
        let socketUser = {
            user: user.user,
            socketId: socket.id
        }
        activeUsersList.push(socketUser);
        console.log("usuarios Conectados:", activeUsersList);
        io.sockets.emit('updateActiveUsers',activeUsersList);
        console.log(activeUsersList);
        io.sockets.emit('updateConnectedUsers', connectedUsers);
        getMessages(user.user, "main");
        getFolders(user.user).then(result =>{
	    console.log(result);
            io.sockets.emit('getFolders', result);
        });
        socket.on('chat:message', (data) => {
            io.sockets.emit('chat:message', data);
            console.log(data);
            insertMessage(data.message, "text", data.user, data.folder);
        });
    });
    socket.on('createFolder', (data)=>{
        createFolder(data.user, data.folderName).then(result =>{
            if(result) io.sockets.emit("createdFolder", data);
        });
    });
    socket.on('getFolders', (data) => getFolders(data.user).then(result => {
        io.sockets.emit('getFolders', result)
    }));
    socket.on('changedFolder', (data)=> getMessagesFol(data.user, data.folder));
    socket.on('getActiveFriends', (friendList)=>{
        let activeFriendListRes = [];
        let i = 0;
        for (let obj of activeUsersList) {
            activeFriendListRes.push(obj.user);
            i++;
        }
        console.log("active friends:", activeFriendListRes);
        io.sockets.emit('getActiveFriends', activeFriendListRes);
    });

    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data); 
    });
    // Usuario B responde con su "identidad" técnica
    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });
    // Ambos intercambian sus direcciones IP públicas (Candidatos ICE)
    socket.on('ice-candidate', (data) => {
        socket.broadcast.emit('ice-candidate', data);
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        io.sockets.emit('updateConnectedUsers', connectedUsers);
        let i = 0;
        for (let obj of activeUsersList) {
            if(obj.socketId == socket.id) activeUsersList.splice(i,1); 
            i++;
        }
        io.sockets.emit('updateActiveUsers',activeUsersList);
        console.log("actual active user list:", activeUsersList);
    });
});