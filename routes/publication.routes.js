const express = require('express');
const router= express.Router();
const PublicationController = require('../controllers/publication.controller');
const multer = require('multer');
const { auth } = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,"./uploads/publications/");
    },
    filename: (req, file, cb) => {
        cb(null, `pub-${Date.now()}-${file.originalname}`);
    }
});

const uploads = multer({storage});


router.get('/publication', PublicationController.pruebaPublication);
router.post('/save', auth, PublicationController.save);
router.get('/details/:id', auth, PublicationController.detalle);
router.delete('/remove/:id', auth, PublicationController.remove);
router.get('/user/:id/:page?', auth, PublicationController.user)
router.post('/upload/:id', [auth, uploads.single('file0')], PublicationController.upload);
router.get('/media/:file', PublicationController.media);
router.get('/feed/:page?', auth, PublicationController.feed);


module.exports = router;
