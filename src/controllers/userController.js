import userService from '../service/userService' 

let handleLogin =async (req, res) =>{
    let email = req.body.email;
    let password = req.body.password;
   /**
    * body là truyền dữ liệu kiểu post ẩn bên dưới
    */
    if(!email || !password){
        return res.status(500).json({
            errCode: 1,
            message: 'Parameter missing'
        })
    }
    let userData = await userService.handleUserLogin(email, password);
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,  
        user: userData.user ? userData.user :{}
    })
}
let handleGetAllUser = async (req, res) =>{
    let id =req.query.id;
    /**
     * query là truyền dữ kiểu get trực tiếp trên url 
     */
    if(!id){
        return res.status(200).json({
            errCode: 1, 
            message: 'Parameter missing',
            users: []
        })
    }
    let users = await userService.getAllUser(id);
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        users: users
    })

}
let handleCreateNewUser = async (req, res)=>{
    let mess = await userService.createNewUser(req.body)
    return res.status(200).json(mess)
}
let handleEditUser = async (req, res)=>{
    let data = req.body
    let mess = await userService.updateUser(data)
    return res.status(200).json(mess)

}
let handleDeleteUser = async (req, res)=>{
    let id =req.body.id;
    if(!id){
        return res.status(200).json({
            errCode: 1,
            errMessage: "Parameter missing"
        })
    }else{
        let mess = await userService.deleteUser(id);
        return res.status(200).json(mess)
    }

}

let handleGetAllCodes = async (req, res)=>{
    try {
        let data = await userService.getAllCode(req.query.type);
        return res.status(200).json(data);

    } catch (error) {
        console.log('Get allcodes error: ',e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from sever'
        })

    }
}


module.exports = {
    handleLogin,
    handleGetAllUser,
    handleCreateNewUser,
    handleEditUser,
    handleDeleteUser,
    handleGetAllCodes,
}