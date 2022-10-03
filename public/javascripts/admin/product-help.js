
// Open File input on click icon
function chooseSlider() {
    document.getElementById('inputChoose').click();
}


function viewImage(event) {
    let inputDiv = document.getElementById('choose-image-div')

    if (event.target.files && event.target.files[0]) {
        let leng = event.target.files.length
        for (let i = 0; i < 4; i++) {
            document.getElementById('image-show-' + [i]).src = ''
            document.getElementById('image-show-' + [i]).style.display = 'none'
        }
        if (leng > 4) {
            document.getElementById('inputChoose').value = null
           
            alert('4 picher only allowed')
        } else {
            for (let i = 0; i < leng; i++) {
                if (i == 3) {
                    inputDiv.style.display = 'none'
                }
                let one = document.getElementById('image-show-' + [i])
                one.style.display = 'block'
                one.src = URL.createObjectURL(event.target.files[i])
            }
        }
    }

}