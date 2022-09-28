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
    verifyArtist: (req, res, next) => {
        if (req.session._BR_ARTIST) {
            artistHelper.checkAccountActive(req.session._BR_ARTIST.arId).then((result) => {
                if (result.activeErr) {
                    let artist = req.session._BR_ARTIST
                    res.render('artist/blocked-page', { title: 'Account Blocked | Bristles', artist, })
                } else {
                    next()
                }
            })
        } else {
            res.redirect('/artist/sign-in')
        }
    },
    verifyAccountConfirm: (req, res, next) => {
        if (req.session._BR_ARTIST_CHECK) {
            artistHelper.checkAccountActivation(req.session._BR_ARTIST_CHECK_ID).then((response) => {
                if (response) {
                    res.redirect('/artist/check-account')
                } else {
                    req.session._BR_ARTIST_CHECK_ID = false
                    req.session._BR_ARTIST_CHECK = false
                    next()
                }
            })
        } else {
            next()
        }
    },

    // User
    verifyUser: (req, res, next) => {
        if (req.session._BR_USER) {
            userHelper.checkAccountActive(req.session._BR_USER.urId).then((result) => {
                if (result.activeErr) {
                    let user = req.session._BR_USER
                    res.render('user/blocked-page', { title: 'Account Blocked | Bristles', user, })
                } else {
                    next()
                }
            })
        } else {
            res.redirect('/sign-in')
        }
    },
    verifyTokenOrUser: (req, res, next) => {
        if (req.session._BR_USER) {
            next()
        } else if (req.session._BR_TOKEN) {
            next()
        } else {
            userHelper.setToken().then((token) => {
                req.session._BR_TOKEN = token
                next()
            })
        }
    }


}