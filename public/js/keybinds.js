document.onkeydown = checkKey;

function checkKey(evt) {
    const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
    evt = evt || window.event;

    // Check if the event target is one of the form elements
    if (formElements.includes(evt.target.tagName)) {
        return; // Ignore key presses if focused on an input
    }

    if (evt.code === 'KeyB' || evt.code === 'KeyG') {
        ToggleBucket(); // Ensure this function is defined
    } 
}
