let artistHelper = require('../helpers/artist-helpers')
let userHelper = require('../helpers/user-helpres')


module.exports = {

    // Admin
    verifyAdmin: (req, res, next) => {
        if (req.session._BR_ADMIN) {
            next()
        } else {
            res.redirect('/admin/sign-in')
        }
    },

    // Artist

    // middlewear
    verifyArtist: async (req, res, next) => {
        try {
            if (req.session._BR_ARTIST) {
                let result = await artistHelper.checkAccountActive(req.session._BR_ARTIST.arId)
                if (result.activeErr) {
                    let artist = req.session._BR_ARTIST
                    res.render('artist/blocked-page', { title: 'Account Blocked | Bristles', artist, })
                } else {
                    next()
                }

            } else {
                res.redirect('/artist/sign-in')
            }

        } catch (error) {
            reject(error)
        }
    },
    verifyAccountConfirm: async (req, res, next) => {
        try {
            if (req.session._BR_ARTIST_CHECK) {
                let response = await artistHelper.checkAccountActivation(req.session._BR_ARTIST_CHECK_ID)
                if (response) {
                    res.redirect('/artist/check-account')
                } else {
                    req.session._BR_ARTIST_CHECK_ID = false
                    req.session._BR_ARTIST_CHECK = false
                    next()
                }

            } else {
                next()
            }

        } catch (error) {
            reject(error)
        }
    },

    // User
    verifyUser: async (req, res, next) => {
        try {
            if (req.session._BR_USER) {
                let result = await userHelper.checkAccountActive(req.session._BR_USER.urId)
                if (result.activeErr) {
                    let user = req.session._BR_USER
                    res.render('user/blocked-page', { title: 'Account Blocked | Bristles', user, })
                } else {
                    next()
                }

            } else {
                res.redirect('/sign-in')
            }

        } catch (error) {
            reject(error)
        }
    },
    verifyTokenOrUser: async (req, res, next) => {
        try {
            if (req.session._BR_USER) {
                next()
            } else if (req.session._BR_TOKEN) {
                next()
            } else {
                let token = await userHelper.setToken()
                req.session._BR_TOKEN = token
                next()
            }

        } catch (error) {
            reject(error)
        }
    }


}