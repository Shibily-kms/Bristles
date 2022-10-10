function callfun(obj) {
    var noimg = "/images/avatar/avatar3.png";
    obj.src = noimg;
}


// Table SetUp
$(document).ready(function () {
    $('#table_id').DataTable();
});



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

// Network Status
function hasNetWork(online) {
    const element = document.querySelector("#networkInfo");
   

    if (online) {
        element.className = 'badge rounded-pill bg-success pt-2'
        element.innerHTML = 'Online'
        
    } else {
        element.className = 'badge rounded-pill bg-danger pt-2'
        element.innerHTML = 'Offline'

      
        
    }

}

window.addEventListener("load", () => {
    hasNetWork(navigator.onLine);

    window.addEventListener("online", () => {
        hasNetWork(true)
    })
    window.addEventListener("offline", () => {
        hasNetWork(false)
    })
})