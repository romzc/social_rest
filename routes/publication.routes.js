const express = require('express');
const router= express.Router();
const PublicationController = require('../controllers/publication.controller');

router.get('/publication', PublicationController.pruebaPublication);


module.exports = router;
