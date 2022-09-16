
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
        box.innerHTML = "Clear symbols in First name"
        event.preventDefault();
    } else if (!lastnameValid) {
        box.style.display = 'block'
        box.innerHTML = "Clear symbols in Last name"
        event.preventDefault();
    } else if (!usernameValid) {
        box.style.display = 'block'
        box.innerHTML = "Clear symbols in User name"
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


// User Address Validation

function userProfileEditForm() {
    console.log("HI");

    let firstname = document.getElementById('firstName')
    let lastname = document.getElementById('lastName')
    let username = document.getElementById('userName')
    let mobile = document.getElementById('mobile')
    let firstnameAlert = document.getElementById('firstNameAlert')
    let lastnameAlert = document.getElementById('lastNameAlert')
    let usernameAlert = document.getElementById('userNameAlert')
    let mobileAlert = document.getElementById('mobileAlert')

    var regex = /^[A-Za-z ]+$/
    var uregex = /^[A-Za-z0-9 ]+$/

    var firstnameValid = regex.test(firstname.value);
    var lastnameValid = regex.test(lastname.value);
    var usernameValid = uregex.test(username.value);

    if (firstname.value == "") {
        firstnameAlert.style.display = 'block'
        firstnameAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        firstnameAlert.style.display = 'none'
    }
    if (!firstnameValid) {
        firstnameAlert.style.display = 'block'
        firstnameAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Must remove symbols !`
        return false;
    } else {
        firstnameAlert.style.display = 'none'
    }
    if (lastname.value == "") {
        lastnameAlert.style.display = 'block'
        lastnameAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        lastnameAlert.style.display = 'none'
    }
    if (!lastnameValid) {
        lastnameAlert.style.display = 'block'
        lastnameAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Must remove symbols !`
        return false;
    } else {
        lastnameAlert.style.display = 'none'
    }
    if (username.value == "") {
        usernameAlert.style.display = 'block'
        usernameAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        usernameAlert.style.display = 'none'
    }
    if (!usernameValid) {
        usernameAlert.style.display = 'block'
        usernameAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Must remove symbols !`
        return false;
    } else {
        usernameAlert.style.display = 'none'
    }
    if (mobile.value == "") {
        mobileAlert.style.display = 'block'
        mobileAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        mobileAlert.style.display = 'none'
    }

    if (mobile.value.length < 10) {
        mobileAlert.style.display = 'block'
        mobileAlert.innerHTML = `<i class='bx bxs-info-circle'></i> 10 numbers are required !`
        return false;
    } else {
        mobileAlert.style.display = 'none'
    }
}

// View Image Choose input
function viewProfile(event) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
        let one = document.getElementById('uploadedProfile')
        one.src = URL.createObjectURL(event.target.files[0])
    }
}

// Change Password
function userChangePassword() {
    let currentPassword = document.getElementById('currentPassword')
    let newPassword = document.getElementById('newPassword')
    let confirmPassword = document.getElementById('confirmPassword')
    let currentAlert = document.getElementById('currentAlert')
    let newAlert = document.getElementById('newAlert')
    let confirmAlert = document.getElementById('confirmAlert')

    if (currentPassword.value == "") {
        currentAlert.style.display = 'block'
        currentAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        currentAlert.style.display = 'none'
    }
    if (currentPassword.value.length < 6) {
        currentAlert.style.display = 'block'
        currentAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Minimum 6 letters are required !`
        return false;
    } else {
        currentAlert.style.display = 'none'
    }
    if (newPassword.value == "") {
        newAlert.style.display = 'block'
        newAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        newAlert.style.display = 'none'
    }
    if (newPassword.value.length < 6) {
        newAlert.style.display = 'block'
        newAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Minimum 6 letters are required !`
        return false;
    } else {
        newAlert.style.display = 'none'
    }
    if (confirmPassword.value == "") {
        confirmAlert.style.display = 'block'
        confirmAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        confirmAlert.style.display = 'none'
    }
    if (confirmPassword.value == newPassword.value) {
        confirmAlert.style.display = 'none'
    } else {
        confirmAlert.style.display = 'block'
        confirmAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Password not match !`
        return false;
    }

}

// Chnage Email

function userChangeEmail() {
    let email = document.getElementById('email')
    let emailAlert = document.getElementById('emailAlert')

    if (email.value == "") {
        emailAlert.style.display = 'block'
        emailAlert.innerHTML = `<i class='bx bxs-info-circle'></i> Required !`
        return false;
    } else {
        emailAlert.style.display = 'none'
    }
    

}