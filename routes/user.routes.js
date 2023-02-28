const express = require('express');
const router= express.Router();
const UserController = require('../controllers/user.controller');

// import multer
const multer = require('multer');
const { auth } = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,"./uploads/avatars/");
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${Date.now()}-${file.originalname}`);
    }
});

const uploads = multer({storage});

router.get('/user-test', auth, UserController.pruebaUser);
router.get('/profile/:id',auth, UserController.userProfile);
router.get('/list/:page?',auth, UserController.listUsers);

router.get('/avatar/:file', auth, UserController.avatar)

router.put('/update', auth, UserController.userUpdate);

router.post('/upload', [auth, uploads.single("file0")], UserController.upload);
router.post('/register', UserController.register);
router.post('/login', UserController.login);


module.exports = router;
