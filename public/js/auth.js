
//First we grab all of the html elements that we are going to need in order to react to the users clicks
const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');
const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
const signOut = document.querySelector('.sign-out');
const sidenav = document.querySelector('.sidenav');
const content = document.querySelectorAll('.content');

//who is currently logged in? Only set after log in complete
let currentUser;

//toggle auth modals. Should the app display the log in or sign up page?
authSwitchLinks.forEach((link) => {
    link.addEventListener('click', () => {
        authModals.forEach((modal) => modal.classList.toggle('active'));
    });
});

// register form. Note that this form is currently always being hidden
registerForm.addEventListener('submit', (e) => {
    //don't let the page refresh on submit
    e.preventDefault();

    const email = registerForm.email.value;
    const password = registerForm.password.value;

    console.log(email, password);
    //send new user data to firebase
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
            console.log('registered', user);
            registerForm.reset();

        })
        .catch((error) => {
            registerForm.querySelector('.error').textContent = error.message;
        })
});

//login form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    console.log(email, password);
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            console.log('logged in', user);
            currentUser = user;
            loginForm.reset();
        })
        .catch((error) => {
            loginForm.querySelector('.error').textContent = error.message;
        })
});

//sign out
signOut.addEventListener('click', () => {
    firebase.auth().signOut()
        .then(() => {
            console.log('signed out');
        })
});

// auth listener. Displays content when user is logged in and hides it if they are not.

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        authWrapper.classList.remove('open');
        authModals.forEach(modal => modal.classList.remove('active'));
        sidenav.classList.add('show');
        content.forEach(content => content.classList.add('show'));
    } else {
        authWrapper.classList.add('open');
        authModals[0].classList.add('active');
        sidenav.classList.remove('show');
        content.forEach(content => content.classList.remove('show'));
    }
});