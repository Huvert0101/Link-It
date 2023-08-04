export function login(req, res){
    console.log(req.body)
    console.log("request")
    console.log(req.body.username)
    const login = req.body.chosed_login;
    const username = req.body.username;
    const password = req.body.password
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
                        res.sendStatus(200);
                    }
                });
            }
        });
    }else{
        Login(newUser, newPassword).then(result =>{
            if(result.length < 1){
                res.send("Usuario no encontrado intente con otras credenciales");
            }
            if(newUser == result[0].user && newPassword == result[0].password){
                res.cookie("username", newUser,{maxAge: 1500000000});
                res.cookie("password", newPassword, {maxAge: 1500000000});
                res.sendStatus(200);
            }else{
                res.send("User or password are incorrect");
            }
        });
    }
}