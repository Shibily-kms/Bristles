
// Wish List
function wishProduct(prId) {
    $.ajax({
        url: '/wish-product',
        data: {
            prId
        },
        method: 'post',
        success: (response) => {
            let p = document.getElementById('wishCount'+prId);
            let count = Number(p.innerHTML)
            if (response.status) {
                document.getElementById('icon' + prId).style.color = 'red'
                p.innerHTML = count + 1
                PopAlert('Add to Wishlist')
            } else if (response.nullUser) {
                PopAlert('Sign In Now to Wish prouduct', 'danger')
            } else {
                document.getElementById('icon' + prId).style.color = 'red'
                p.innerHTML = count - 1
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
            $("#user-wishlist").load(window.location.href + " #user-wishlist" );
            PopAlert('Remove from Wishlist')
        }
    })
}

// OTP
function resendOtp() {
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
function resendArtistOtp() {
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


// Carousel Auto Working
let carouselIndicators = document.getElementById('carousel-indicators')
let one = carouselIndicators.firstElementChild
one.className = "active"

let carouseInner = document.getElementById('carousel-inner')
let first = carouseInner.firstElementChild
first.className = "carousel-item active"

