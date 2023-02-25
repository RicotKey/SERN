import db from '../models/index'
import userService from '../service/userService' 
let handleLogin =async (req, res) =>{
    let email = req.body.email;
    let password = req.body.password;
   
    if(!email || !password){
        return res.status(500).json({
            errCode: 0,
            massage: 'Parameter missing'
        })
    }
    let userData = await userService.handleUserLogin(email, password);
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,  
        user: userData.user ? userData.user :{}
    })
}

module.exports = {
    handleLogin
}