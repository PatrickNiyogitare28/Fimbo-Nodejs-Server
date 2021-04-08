//generates random id;
let getEmailVerCode = () => {
    return (Math.floor(100000 + Math.random() * 900000));
}
module.exports.getEmailVerCode = getEmailVerCode;
