const { response } = require("express");



// User Cancel Order

function cancelUserOrder(orId) {
    let alert = confirm('Cancel this Order ?');
    if (alert) {
        $.ajax({
            type: "POST",
            url: '/order/cancel/',
            data: {
                orId
            },
            success: function (response) {
                location.reload()
            }
        });
    }
}

// Admin Change Order Status
function changeStatus(value, orId) {
    $.ajax({
        type: "POST",
        url: '/admin/order-list/change-order-status',
        data: {
            status: value,
            orId
        },
        success: function (response) {
            location.reload()
        }
    });
}