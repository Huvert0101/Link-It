import path from 'path'
import fs from 'fs'
import multer from 'multer';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
const storage = multer.diskStorage({
    destination: 'public/files/',
    filename: function(req, file, cb){
        cb("", file.originalname);
    }
});
const upload = multer({limits: { fileSize: 5 * 1024 * 1024 * 1024 }, storage: storage })
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express'
import { conn } from './db.js'
const app = express();
//settings
app.use(cors());
app.set('port', process.env.PORT || 3000);
//static files;
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
var jsonParser = bodyParser.json({ limit: '50000mb' })
// SQL
async function insertMessage(message, type, user, folder){
    await conn.query("INSERT INTO messages(message, type, user, folder) VALUES('"+ message +"', '"+ type +"', '" + user + "', '" + folder + "')");
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
            const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
            resolve(mp3Files);
        });
    });
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
})
app.get('/getMusic', async (req, res) => {
    const musicPath = path.join(__dirname, 'public', 'files');
    try {
        const mp3Files = await getMp3Files(musicPath);
        console.log(musicPath);
        console.log("hellou");
        console.log(mp3Files);
        res.json(mp3Files);
    } catch (err) {
        console.log("puto");
        console.log(musicPath);
        console.log(err);
        res.status(500).json({ error: err });
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
    console.log(await getFoldersFriends(user));
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
})
//start the server
const server = app.listen(app.get('port'), ()=> {
    console.log('Server on port', app.get('port'));
});
import {Server} from 'socket.io'
const io = new Server(server);
app.post('/upload', upload.single('file'), function(req, res, next){
    insertMessage('files/' + req.file.originalname, "file", req.body.user, req.body.folder);
    io.sockets.emit('getFiles', {
        message: 'files/' + req.file.originalname,
        type: 'file',
        user: req.body.user
    });
    res.redirect("/");
})
async function getMessages(user, folder){//maybe parameter: folder
    const [res] = await conn.query("SELECT * FROM messages WHERE user = '"+user+"' AND folder = '"+folder+"'");
    io.sockets.emit('getMessages', res);
}
async function getMessagesFol(user, folder){//maybe parameter: folder
    const [res] = await conn.query("SELECT * FROM messages WHERE user = '"+user+"' AND folder = '"+folder+"'");
    io.sockets.emit('getMessagesFol', res);
}
async function getFolders(user){
    const [res] = await conn.query("SELECT * FROM folders WHERE user = '"+user+"' AND folder NOT LIKE 'friend%'");
    return res;
}
//websockets
io.on('connection', (socket) => {
    console.log("Socket connected!")
    socket.on('getUser', (user)=>{
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
    socket.on('changedFolder', (data)=> getMessagesFol(data.user, data.folder));
});

