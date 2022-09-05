
// Form On Submit Validation
document.getElementById('userSignUpForm').addEventListener('submit', (event) => {
    let box = document.getElementById('alertBox')
    let firstname = document.getElementById('firstname')
    let lastname = document.getElementById('lastname')
    let username = document.getElementById('username')
    let email = document.getElementById('email')
    let password = document.getElementById('password')
    let cpassword = document.getElementById('cpassword')

    var regex = /^[A-Za-z ]+$/
    var uregex = /^[A-Za-z0-9 ]+$/
    
    var firstnameValid = regex.test(firstname.value);
    var lastnameValid = regex.test(lastname.value);
    var usernameValid = uregex.test(username.value);

    if (firstname.value == "" || lastname.value == "" || username.value == "" || email.value == "" || password.value == "" || cpassword.value == "") {
        box.style.display = 'block'
        box.innerHTML = "Please fill the form"
        event.preventDefault();
    } else if (!firstnameValid) {
        box.style.display = 'block'
        box.innerHTML = "Clear simples in First name"
        event.preventDefault();
    } else if (!lastnameValid) {
        box.style.display = 'block'
        box.innerHTML = "Clear simples in Last name"
        event.preventDefault();
    } else if (!usernameValid) {
        box.style.display = 'block'
        box.innerHTML = "Clear simples in User name"
        event.preventDefault();
    } else if (password.value.length < 6) {
        box.style.display = 'block'
        box.innerHTML = "Password must contain 6 charecter"
        event.preventDefault();
    } else if (password.value != cpassword.value) {
        box.style.display = 'block'
        box.innerHTML = "Password not match"
        event.preventDefault();
    }
})

// Form Password Show and Hide
document.getElementById('eyeIcon').addEventListener('click', (event) => {
    let password = document.getElementById("password")
    let icon = document.getElementById('eyeIcon')
    if (password.type === "password") {
        password.type = "text"
        icon.innerHTML = `<i class='bx bx-show'></i>`
    } else {
        password.type = "password"
        icon.innerHTML = `<i class='bx bx-hide'></i>`

    }
})

// Form Cofierm Password Show and Hide
document.getElementById('cEyeIcon').addEventListener('click', (event) => {
    let password = document.getElementById("cpassword")
    let icon = document.getElementById('cEyeIcon')
    if (password.type === "password") {
        password.type = "text"
        icon.innerHTML = `<i class='bx bx-show'></i>`
    } else {
        password.type = "password"
        icon.innerHTML = `<i class='bx bx-hide'></i>`

    }
})
