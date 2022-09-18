const multer = require("multer")

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/products')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
})

const userStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/user')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
})

const artistStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/artist')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
})
const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/carousel')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
})

module.exports = store = {
    product: multer({ storage: productStorage }),
    user: multer({ storage: userStorage }),
    artist: multer({ storage: artistStorage }),
    carousel: multer({ storage: carouselStorage }),

}