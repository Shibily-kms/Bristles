function addToCart(prId) {

    $.ajax({
        url: '/add-to-cart',
        data: {
            prId
        },
        method: 'post',
        success: (response) => {
            if (response.alreadyErr) {
                location.replace('/cart')
            } else {
                let count = document.getElementById('cart-count').innerHTML
                count = parseInt(count) + 1
                document.getElementById('cart-count').innerHTML = count
            }

        }
    })
}

// Get Cart Count
function cartCount() {
    $.ajax({
        url: '/cart-count',
        data: {
        },
        method: 'post',
        success: (count) => {
            document.getElementById('cart-count').innerHTML = count
            document.getElementById('cart-count-page').innerHTML = count

        }
    })
}
cartCount()

// Remove Product
function removeProduct(prId) {
    let q = confirm('Remove this product from cart ?')
    if (q) {
        $.ajax({
            url: '/remove-from-cart',
            data: {
                prId
            },
            method: 'post',
            success: (response) => {
                if (response) {

                    location.reload()
                }

            }
        })
    }
}

function deleteAddress(adId) {
    let confirmAlert = confirm('Delete this address ?')
    if (confirmAlert) {
        console.log('yes');
        $.ajax({
            url: '/delete-address',
            data: {
                adId
            },
            method: 'post',
            success: (response) => {
                if (response) {
                    location.reload()
                }

            }
        })
    }
}

// this is the id of the form
$("#accordionIcon-5").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(), // serializes the form's elements.
        success: function (data) {
            location.reload()
        }
    });

});

$("#accordionIcon-0").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(), // serializes the form's elements.
        success: function (data) {
            location.reload()
        }
    });

});

$("#accordionIcon-1").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(), // serializes the form's elements.
        success: function (data) {
            location.reload()
        }
    });

});

$("#accordionIcon-2").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(), // serializes the form's elements.
        success: function (data) {
            location.reload()
        }
    });

});

$("#accordionIcon-3").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(), // serializes the form's elements.
        success: function (data) {
            location.reload()
        }
    });

});

function changeCurrentAddress(adId) {
    $.ajax({
        url: '/change-current-address',
        data: {
            adId
        },
        method: 'post',
        success: (response) => {
            if (response) {
                location.reload()
            }

        }
    })
}

// Coupon Code
function checkCouponCode() {
    let cpCode = document.getElementById('couponInput').value
    $.ajax({
        url: '/checkCoupon',
        data: {
            cpCode
        },
        method: 'post',
        success: (response) => {
            if (response.notAvailable) {
                let alert = document.getElementById('couponAlert')
                alert.style.display = 'block'
                alert.innerHTML = `<i class='bx bxs-info-circle'></i> This coupon code not available`
            } else if (response.expired) {
                let alert = document.getElementById('couponAlert')
                alert.style.display = 'block'
                alert.innerHTML = `<i class='bx bxs-info-circle'></i> This coupon expired`
            } else if (response) {
                let price = document.getElementById('totalPrice').innerHTML
                price = Number(price)
                if (response.value >= price) {
                    let alert = document.getElementById('couponAlert')
                    alert.style.display = 'block'
                    alert.innerHTML = `<i class='bx bxs-info-circle'></i> This coupon not allowed this product`
                } else {
                    document.getElementById('couponDiv').className = 'd-flex justify-content-between text-dark'
                    document.getElementById('couponValue').innerHTML = '-₹' + response.value
                    document.getElementById('totalPrice').innerHTML = price - response.value
                    document.getElementById('couponAlert').style.display = 'none'
                    let discount = Number(document.getElementById('discoundPrice').innerHTML)
                    document.getElementById('discoundPrice').innerHTML = discount + Number(response.value) 
                }
            }

        }
    })
}