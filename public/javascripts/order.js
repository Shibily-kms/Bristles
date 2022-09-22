
$("#payment").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    var actionUrl = form.attr('action');
    let amount = document.getElementById('totalPrice').innerHTML
    let couponCode = document.getElementById('couponInput').value
    let prId = null
    $.ajax({
        type: "POST",
        url: actionUrl,
        data: {
            methord: form.serialize(), // serializes the form's elements.
            amount ,
            cpCode : couponCode,
            prId 
        },
        success: function (urId) {
            location.replace('/checkout/payment/success')
        }
    });

});