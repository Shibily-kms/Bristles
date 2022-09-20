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
    $.ajax({
        url: '/remove-from-cart',
        data: {
            prId
        },
        method: 'post',
        success: (response) => {
           if(response){

            location.reload()
           }

        }
    })
}