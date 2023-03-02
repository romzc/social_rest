const validator = require('validator');

const validate = (params) => {
    let name = !validator.isEmpty(params.name) &&
                validator.isLength(params.name, {min:3, max: undefined}) &&
                validator.isAlpha(params.name, "es-ES");

    let surname = !validator.isEmpty(params.surname) &&
                  validator.isLength(params.surname, {min:3, max: undefined}) &&
                  validator.isAlpha(params.surname, "es-ES");

    let nickname = !validator.isEmpty(params.nickname) &&
                    validator.isLength(params.nickname, {min:2, max: undefined});
                   

    let password = !validator.isEmpty(params.password)

    let email = !validator.isEmpty(params.email) &&
                validator.isEmail(params.email);
    
    if ( params.bio){
        let bio = validator.isLength(params.bio, {min: undefined, max: 255});
        
        if (!bio) {
            throw new Error("No se supero la validacion");
        }
    }

    if ( !name || !surname || !nickname || !password || !email ) 
        throw new Error("No se supero la validacion");
    else 
        console.log("superado")
}

module.exports = { 
    validate
};