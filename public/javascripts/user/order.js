// User Cancel Order

function cancelUserOrder(orId) {
    let alert = confirm('Cancel this Order ?');
    if (alert) {
        let prId = document.getElementById('productId').innerHTML
        let price = document.getElementById('productPrice').innerHTML
        $.ajax({
            type: "POST",
            url: '/order/cancel/',
            data: {
                orId, prId, price
            },
            success: function (response) {
                location.reload()
            }
        });
    }
}

// Admin Change Order Status
function changeStatus(value, orId) {
    let prId = document.getElementById('productId').innerHTML
    
    $.ajax({
        type: "POST",
        url: '/admin/order-list/change-order-status',
        data: {
            status: value,
            orId, prId
        },
        success: function (response) {
            location.reload()
        }
    });
}


// Razore Pay
function razorepayPayment(order) {
    var options = {
        "key": "rzp_test_59KOR6eRcVHKh4", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Bristles Company",
        "description": "Sell Your Paintings",
        "image": "/public/images/avatar/logo2.jpg",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyPayment(response, order)
        },
        "prefill": {
            "name": order.name,
            "email": order.email,
            "contact": order.phone
        },
        "notes": {
            "address": "Kinfra Ramanattukara, Kerala"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response) {
        // alert(response.error.code);
        // alert(response.error.description);
        // alert(response.error.source);
        // alert(response.error.step);
        // alert(response.error.reason);
        // alert(response.error.metadata.order_id);
        // alert(response.error.metadata.payment_id);
        location.replace('/checkout/payment/failed')
    });

    rzp1.open();
}

function verifyPayment(payment, order) {

    $.ajax({
        type: "POST",
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        success: function (response) {
            if (response.status) {
                location.replace('/checkout/payment/success')
            } else if (response) {
                // Lode Err Page
                location.replace('/checkout/payment/failed')
            }
        }
    });
}
