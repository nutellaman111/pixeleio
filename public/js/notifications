function showNotification(text) {
    if (text.trim() === '') return;

    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    
    notificationContainer.appendChild(notification);

    // Make the notification fade out after 3 seconds 
    setTimeout(() => {
        void notification.offsetWidth;
        notification.classList.add('fade-out');
        // Remove the notification after the fade out animation
        notification.addEventListener('transitionend', () => {
            notification.remove();
        });
    }, 0);
}
