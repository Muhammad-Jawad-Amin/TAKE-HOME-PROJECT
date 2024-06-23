const form = document.querySelector("form"),
  firstnameField = form.querySelector(".firstname-field"),
  firstnameInput = firstnameField.querySelector(".firstname"),
  lastnameField = form.querySelector(".lastname-field"),
  lastnameInput = lastnameField.querySelector(".lastname"),
  emailField = form.querySelector(".email-field"),
  emailInput = emailField.querySelector(".email"),
  passField = form.querySelector(".password-field"),
  passInput = passField.querySelector(".password"),
  cPassField = form.querySelector(".confirm-password"),
  cPassInput = cPassField.querySelector(".cPassword");

// Name Validtion
function checkname() {
  const namePattern = /^(?=.*[a-z])/;
  if (!firstnameInput.value.match(namePattern)) {
    return firstnameField.classList.add("invalid"); //adding invalid class if email value do not mathced with email pattern
  }
  firstnameField.classList.remove("invalid"); //removing invalid class if email value matched with emaiPattern
}

// Username Validtion
function checkusername() {
  const usernamePattern = /^(?=.*[a-z]{2,3}$)/;
  if (!lastnameInput.value.match(usernamePattern)) {
    return lastnameField.classList.add("invalid"); //adding invalid class if email value do not mathced with email pattern
  }
  lastnameField.classList.remove("invalid"); //removing invalid class if email value matched with emaiPattern
}

// Email Validtion
function checkEmail() {
  const emaiPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!emailInput.value.match(emaiPattern)) {
    return emailField.classList.add("invalid"); //adding invalid class if email value do not mathced with email pattern
  }
  emailField.classList.remove("invalid"); //removing invalid class if email value matched with emaiPattern
}

// Hide and show password
const eyeIcons = document.querySelectorAll(".show-hide");

eyeIcons.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    const pInput = eyeIcon.parentElement.querySelector("input"); //getting parent element of eye icon and selecting the password input
    if (pInput.type === "password") {
      eyeIcon.classList.replace("bx-hide", "bx-show");
      return (pInput.type = "text");
    }
    eyeIcon.classList.replace("bx-show", "bx-hide");
    pInput.type = "password";
  });
});

// Password Validation
function createPass() {
  const passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passInput.value.match(passPattern)) {
    return passField.classList.add("invalid"); //adding invalid class if password input value do not match with passPattern
  }
  passField.classList.remove("invalid"); //removing invalid class if password input value matched with passPattern
}

// Confirm Password Validtion
function confirmPass() {
  if (passInput.value !== cPassInput.value || cPassInput.value === "") {
    return cPassField.classList.add("invalid");
  }
  cPassField.classList.remove("invalid");
}

//calling function on key up
firstnameInput.addEventListener("keyup", checkname);
lastnameInput.addEventListener("keyup", checkusername);
emailInput.addEventListener("keyup", checkEmail);
passInput.addEventListener("keyup", createPass);
cPassInput.addEventListener("keyup", confirmPass);

// Calling Funtion on Form Sumbit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  checkEmail();
  checkname();
  checkusername();
  createPass();
  confirmPass();

  if (
    !lastnameField.classList.contains("invalid") &&
    !firstnameField.classList.contains("invalid") &&
    !emailField.classList.contains("invalid") &&
    !passField.classList.contains("invalid") &&
    !cPassField.classList.contains("invalid")
  ) {

    try {
      const firstname = firstnameInput.value;
      const lastname = lastnameInput.value;
      const email = emailInput.value;
      const password = passInput.value;
      const confpassword = cPassInput.value;

      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: firstname, lastname: lastname,
          email: email, password: password, confpassword: confpassword,
        }),
      });

      const data = await response.json();

      if (data['status'] === 'success') {
        window.location.href = data.redirect;
        // Reset form fields
        form.reset();
      } else {
        alert('Signup failed: ' + data.message);
      }
    } catch (error) {
      alert('An error occurred while signing you up. Please try again.');
    }
  }
});