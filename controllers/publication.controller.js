const Publication = require('../models/publication.model')
const fs = require('fs');
const path = require('path');

// import service functions
const followService = require('../services/follow.service');


const pruebaPublication = (req, res) => {
    return res.status(200).json({ message: "prueba" });
}


// save publication
const save = (req, res) => {
    // recoger datos del boy
    const body = req.body;

    // si no me llegar dar respuesta negativa
    if (!body.text) {
        return res.status(400).json({ error: "error", message: "text is required" });
    }

    // crear y rrellenar en un objecto publication
    const newPublication = new Publication(body);
    // guardar el objeto en la bbdd
    newPublication.user = req.user.id;
    // retornar el nuevo objeto publication
    newPublication.save((error, publicationStored) => {
        if (error || !publicationStored) {
            return res.status(400).json({ error: "error", message: "error while saving publication" });
        }
        return res.status(200).json({
            status: "success",
            message: "publication stored successfully",
            newPublication: publicationStored
        });
    });
}

// sacar una publicacion
const detalle = (req, res) => {

    // get publication id from request params
    const publicacionId = req.params.id;
    // find a publication with same id
    Publication.findById(publicacionId, (err, publication) => {
        if (err || !publication) {
            return res.status(404).json({ error: "error", message: "publication not found" });
        }

        return res.status(200).json({
            status: "success",
            publication
        });
    });
    // return an object if it exists otherwise return an error message

};

// eliminar publicaciones
const remove = (req, res) => {

    const publicacionId = req.params.id;

    Publication.find({ user: req.user.id, _id: publicacionId })
        .remove((error) => {
            if (error) {
                return res.status(500).json({ error: "error", message: "publication was not deleted" });
            }
            return res.status(200).json({
                status: "success",
                message: "publicacion removed successfully",
                publicacion: publicacionId
            });
        });

}

// listar todas las publicaiones
const user = (req, res) => {

    const userId = req.params.id;

    let page = 1;
    if (req.params.page) page = req.params.page;

    const itemsPerpage = 5;

    Publication.find({ user: userId })
        .sort("-create_at")
        .populate('user', '-password -__v -role -email')
        .paginate(page, itemsPerpage, (error, publications, total) => {

            if (error || !publications) {
                return res.status(404).send({ status: "error", message: "load user publication failed" });
            }

            return res.status(200).json({
                status: "success",
                message: "user publications",
                page,
                total,
                pages: Math.ceil(total / itemsPerpage),
                publications
            });
        })
};

// listar publicaciones de un usuario


// subir ficheros
const upload = (req, res) => {

    // get publication id from request params
    const publicationId = req.params.id

    // get image file and check if it exists
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "request doesn't include image file"
        })
    }

    // get image filename 
    const image = req.file.originalname;

    // get file extension and check if it exists in allowed extensions,
    const imageSplit = image.split("\.");
    let extension = imageSplit[1];

    // if it is not in allowed extensions, delete file
    if (extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif") {
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);
        return res.status(400).send({
            status: "error",
            message: "Image extension not allowed"
        })
    }
    // otherwise update user profile image
    Publication.findOneAndUpdate({ user: req.user.id, _id: publicationId }, { file: req.file.filename }, { new: true }, (error, pubUpdated) => {
        if (error || !pubUpdated) {
            return res.status(500).send({
                status: "error",
                message: "error while updating user"
            });
        }

        // finally return an object with user information
        return res.status(200).send({
            status: "success",
            user: pubUpdated,
            file: req.file,
        })
    })
}

// devolver archivos, imagenes.
const media = (req, res) => {
    // get parameter from url
    const file = req.params.file;

    // mount image real path
    const filePath = `./uploads/publications/${file}`;

    // check if image exists
    fs.stat(filePath, (error, exist) => {

        if (error || !exist) {
            return res.status(404).send({
                status: "error",
                message: "image not found"
            });
        }
        // return file
        return res.status(200).sendFile(path.resolve(filePath));
    })
}


// list publications from people who i follow
const feed = async (req, res) => {

    // sacar la pagina actual
    let page = 1;
    if (req.params.page) page = req.params.page;

    // establecer numero de elementos por pagina
    let itemsPerpage = 5;
    // sacar un array de identificadoes de los usarios que yo sigo
    try {
        // buscar las publicaciones de los usuarios que sigo
        const myFollows = await followService.followUserIds(req.user.id);

        Publication.find({ user: { "$in": myFollows.following } })
            .populate("user", "-password -role -__v -email")
            .sort("-create_at")
            .paginate(page, itemsPerpage,
                (error, publications, total) => {
                    if (error || !publications) {
                        return res.status(500).send({
                            status: "error",
                            message: "error while getting feed"
                        });
                    }

                    return res.status(200).send({
                        status: "success",
                        message: "feed de pubs",
                        myFollows: myFollows.following,
                        itemsPerpage,
                        page,
                        total,
                        pages: Math.ceil(total / itemsPerpage),
                        publications,
                    });
                });

    } catch (err) {
        return res.status(500).send({
            status: "error",
            message: "error while getting feed"
        });
    }

}

module.exports = {
    pruebaPublication,
    save,
    detalle,
    remove,
    user,
    upload,
    media,
    feed
}

