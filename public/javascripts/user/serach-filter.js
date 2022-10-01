document.getElementById('searchOne').addEventListener('click', searchProduct)
document.getElementById('searchTwo').addEventListener('click', searchProduct)

let searchResult = storeProduct()

function searchProduct() {
    searchResult = []
    let products = storeProduct()
    let mainDiv = document.getElementById('resultShowDiv')
    let value = null
    let value1 = document.getElementById('inputOne').value
    let value2 = document.getElementById('inputTwo').value
    if (value1 == '') {
        value = value2
        value1 = ''
    } else if (value2 == '') {
        value = value1
        value2 = ''
    }

    let searchPattern = new RegExp('(\\w*' + value + '\\w*)', 'gi');
    for (let i = 0; i < products.length; i++) {
        let check = products[i].title.match(searchPattern)
        if (check) {
            searchResult.push(products[i])
        }
    }
    mainDiv.innerHTML = null
    if (searchResult.length == 0 || value1 == '' && value2 == '') {
        mainDiv.innerHTML = `<div class="check-account container">
        <div class="box-boreder">
            <div>
                <img class="" src="/images/icon/no-result.gif" alt="">
                <h4 class="mt-3">Sorry! No result found 
                </h4>
            </div>
        </div>
    </div>`
    } else {
        for (let i = 0; i < searchResult.length; i++) {
            mainDiv.appendChild(createThumb(searchResult[i]))
        }
    }
    return;
}

// Filter Product
function filterProduct() {
    let value1 = document.getElementById('inputOne').value
    let value2 = document.getElementById('inputTwo').value
    if (value1 == '' && value2 == '') {
        searchResult = storeProduct()
    }
    let mainDiv = document.getElementById('resultShowDiv')
    let category = document.getElementById("filterForm").elements["category"]
    let medium = document.getElementById("filterForm").elements["medium"]
    let surface = document.getElementById("filterForm").elements["surface"]
    let quality = document.getElementById("filterForm").elements["quality"]
    let nowCategory = [], nowMedium = [], nowSurface = [], nowQuality = []
    for (let i = 0; i < category.length; i++) {
        if (category[i].checked == true) {
            nowCategory.push(category[i].defaultValue)
        }
    }
    for (let i = 0; i < medium.length; i++) {
        if (medium[i].checked == true) {
            nowMedium.push(medium[i].defaultValue)
        }
    }
    for (let i = 0; i < surface.length; i++) {
        if (surface[i].checked == true) {
            nowSurface.push(surface[i].defaultValue)
        }
    }
    for (let i = 0; i < quality.length; i++) {
        if (quality[i].checked == true) {
            nowQuality.push(quality[i].defaultValue)
        }
    }

    // Product filter

    category = [], medium = [], surface = [], quality = []
    if (nowCategory.length > 0) {
        for (let i = 0; i < searchResult.length; i++) {
            for (let j = 0; j < nowCategory.length; j++) {
                if (nowCategory[j] == searchResult[i].category) {
                    category.push(searchResult[i])
                }
            }
        }
    } else {
        category = searchResult
    }
    if (nowMedium.length > 0) {
        for (let i = 0; i < category.length; i++) {
            for (let j = 0; j < nowMedium.length; j++) {
                if (nowMedium[j] == category[i].medium) {
                    medium.push(category[i])
                }
            }
        }
    } else {
        medium = category
    }
    if (nowSurface.length > 0) {
        for (let i = 0; i < medium.length; i++) {
            for (let j = 0; j < nowSurface.length; j++) {
                if (nowSurface[j] == medium[i].surface) {
                    surface.push(medium[i])
                }
            }
        }
    } else {
        surface = medium
    }
    if (nowQuality.length > 0) {
        for (let i = 0; i < surface.length; i++) {
            for (let j = 0; j < nowQuality.length; j++) {
                if (nowQuality[j] == surface[i].quality) {
                    quality.push(surface[i])
                }
            }
        }
    } else {
        quality = surface
    }

    mainDiv.innerHTML = null

    if (quality.length == 0) {
        mainDiv.innerHTML = `<div class="check-account container">
    <div class="box-boreder">
        <div>
            <img class="" src="/images/icon/no-result.gif" alt="">
            <h4 class="mt-3">Sorry! No result found 
            </h4>
        </div>
    </div>
</div>`
    } else {

        for (let i = 0; i < quality.length; i++) {

            // mainDiv.innerHTML  += createThumb(quality[i])
            mainDiv.appendChild(createThumb(quality[i]))

        }
    }
    return;

}



function createThumb(productOne) {
    //     let model = `<div class="col-sm-6 col-md-4 col-lg-4 mb-4">
    //     <div class="card h-100">
    //         <a class="text-secondary" href="/list/`+ productOne.category + `/` + productOne.prId + `/view">
    //             <img class="card-img-top" src="/images/products/`+ productOne.image[0] + `" alt="product image" />
    //         </a>
    //         <div class="heart-icon " onclick="wishProduct('`+ productOne.prId + `')">
    //             <i class='bx bxs-heart' {{#if this.wishlist.[0]}} style="color: red;" {{/if}}
    //                 id="icon` + productOne.prId + `"></i>
    //         </div>
    //         <a class="text-secondary" href="/list/`+ productOne.category + `/` + productOne.prId + `/view">
    //             <div class="card-body card-boarder">
    //                 <h5 class="">` + productOne.title + `</h5>
    //                 <p>Size : ` + productOne.size + `</p>
    //                 <p>` + productOne.medium + ` - ` + productOne.quality + `</p>
    //                 <div class="card-rate mt-2">
    //                     <div class="artist-rate-card section-two" title="artist-rate">
    //                         <div class="rate">
    //                             <p><i class='bx bxs-star'></i> 3.7</p>
    //                         </div>
    //                     </div>
    //                     <div class="favorite">
    //                         <i class='bx bxs-heart'></i>
    //                         {{#if this.wishCount}}
    //                         <p>{{this.wishCount}}</p>
    //                         {{else}}
    //                         <p>0</p>
    //                         {{/if}}
    //                     </div>
    //                 </div>
    //                 <div class="card-price mt-2">
    //                     <h4 class="text-dark">₹ ` + productOne.price + `</h4>
    //                     <h6 id='ogPrice'>₹` + productOne.ogPrice  + `</h6>
    //                     <i class='bx bxs-offer'></i>
    //                     <h6> ` + productOne.percentage + `% off</h6>
    //                 </div>
    //                 <small>Free delivery</small>
    //             </div>
    //         </a>
    //     </div>
    // </div>`

    // Create Element

    let boarderDiv = document.createElement('div')
    let aTag = document.createElement('a')
    let cardDiv = document.createElement('div')
    let imageTage = document.createElement('img')
    let heartDiv = document.createElement('div')
    let heartI = document.createElement('i')
    let bodyDiv = document.createElement('div')
    let titleTag = document.createElement('h5')
    let sizeTag = document.createElement('p')
    let mediumTag = document.createElement('p')
    let priceDiv = document.createElement('div')
    let h4Tag = document.createElement('h4')
    let h6One = document.createElement('h6')
    let h6Two = document.createElement('h6')
    let ofrIcon = document.createElement('i')
    let smallTag = document.createElement('small')

    // Set Style
    boarderDiv.className = 'col-sm-6 col-md-4 col-lg-4 mb-4'
    aTag.className = 'text-secondary'
    aTag.href = '/list/' + productOne.category + '/' + productOne.prId + '/view'
    aTag.target = '_blank'
    cardDiv.className = 'card h-100'
    imageTage.className = "card-img-top"
    imageTage.src = "/images/products/" + productOne.image[0]
    heartDiv.className = 'heart-icon'
    heartDiv.onclick = ""
    heartI.className = "bx bxs-heart"
    bodyDiv.className = 'card-body card-boarder'
    titleTag.innerHTML = productOne.title
    sizeTag.innerHTML = "Size : " + productOne.size
    mediumTag.innerHTML = productOne.medium + " - " + productOne.surface
    priceDiv.className = "card-price mt-2"
    h4Tag.className = 'text-dark'
    h4Tag.innerHTML = '₹ ' + productOne.price
    if (productOne.ogPrice) {
        h6Two.innerHTML = productOne.percentage + '% off'
        h6One.innerHTML = '₹ ' + productOne.ogPrice
        ofrIcon.className = 'bx bxs-offer'
    }
    smallTag.innerHTML = 'Free delivery'

    // Align Tag
    heartDiv.appendChild(heartI)
    priceDiv.appendChild(h4Tag)
    priceDiv.appendChild(h6One)
    priceDiv.appendChild(ofrIcon)
    priceDiv.appendChild(h6Two)
    bodyDiv.appendChild(titleTag)
    bodyDiv.appendChild(sizeTag)
    bodyDiv.appendChild(mediumTag)
    bodyDiv.appendChild(priceDiv)
    bodyDiv.appendChild(smallTag)
    cardDiv.appendChild(imageTage)
    cardDiv.appendChild(heartDiv)
    cardDiv.appendChild(bodyDiv)
    aTag.appendChild(cardDiv)
    boarderDiv.appendChild(aTag)

    return boarderDiv;
}