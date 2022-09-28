
// Wish List
function wishProduct(prId) {
    $.ajax({
        url: '/wish-product',
        data: {
            prId
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                document.getElementById('icon' + prId).style.color = 'red'
                PopAlert('Add to Wishlist')
            } else if (response.nullUser) {
                PopAlert('Sign In Now to Wish prouduct','danger')
                // location.replace('/sign-in')
            } else {
                document.getElementById('icon' + prId).style.color = 'white'
                PopAlert('Remove from Wishlist')
            }
        }
    })
}

function removeWishProduct(prId) {
    $.ajax({
        url: '/remove-wish-product',
        data: {
            prId
        },
        method: 'post',
        success: (response) => {
            location.reload()
        }
    })
}

// OTP
function resendOtp(){
    $.ajax({
        url: '/resend-otp',
        data: {
           
        },
        method: 'post',
        success: (response) => {
            document.getElementById('otp-description').innerHTML = 'Resended to'
        }
    })
}
function resendArtistOtp(){
    $.ajax({
        url: '/artist/resend-otp',
        data: {
           
        },
        method: 'post',
        success: (response) => {
            document.getElementById('otp-description').innerHTML = 'Resended to'
        }
    })
}
