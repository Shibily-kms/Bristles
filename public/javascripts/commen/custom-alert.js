let alertBox = document.getElementById('smallAlert')
let alertBoxText = document.getElementById('smallAlertText')
let urlOut = null

function BSconfirm(text, url) {
    urlOut = url
    console.log('start');
    alertBox.style.display = 'block'
    alertBox.ariaHidden = false
    alertBox.ariaModal = true
    alertBox.className = 'modal fade show'
    alertBoxText.innerHTML = text ? text : "Choose option"

}

function BSconfirmBox() {
    
    location.replace(urlOut)
    alertBox.ariaHidden = true
    alertBox.ariaModal = false
    alertBox.className = 'modal fade'
    alertBoxText.innerHTML = "Choose option"
    alertBox.style.display = 'none'

}



function BSconfirmCancel() {
   
    alertBox.ariaHidden = true
    alertBox.ariaModal = false
    alertBox.className = 'modal fade'
    alertBoxText.innerHTML = "Choose option"
    alertBox.style.display = 'none'
   
}




