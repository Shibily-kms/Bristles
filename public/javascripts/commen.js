function callfun(obj) {
    var noimg = "/images/avatar/avatar3.png";
    obj.src = noimg;
}


// Table SetUp
$(document).ready(function () {
    $('#table_id').DataTable();
});

// Carousel Auto Working
let carouselIndicators = document.getElementById('carousel-indicators')
let one = carouselIndicators.firstElementChild
one.className = "active"

let carouseInner = document.getElementById('carousel-inner')
let first = carouseInner.firstElementChild
first.className = "carousel-item active"


// Alert Function
function PopAlert(text, type = "success") {
    let popDiv = document.getElementById('customAlerts')
    let alertBox = `<div class="admin-alert"  >
        <div id="alertBoxStyle" class="alert alert-success alert-dismissible" role="alert"><span id="value-alert"></span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    </div>`
    if (type == 'success') {
        popDiv.innerHTML = alertBox
        document.getElementById('value-alert').innerHTML = text
    } else if (type == 'danger') {
        popDiv.innerHTML = alertBox
        document.getElementById('alertBoxStyle').className = 'alert alert-danger alert-dismissible'
        document.getElementById('value-alert').innerHTML = text
    }
}

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
