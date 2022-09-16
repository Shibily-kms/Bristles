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

