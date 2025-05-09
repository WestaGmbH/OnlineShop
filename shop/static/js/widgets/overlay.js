const showOverlayEvent = new Event('showOverlay');
    // Custom event for hiding the overlay
const hideOverlayEvent = new Event('hideOverlay');

// Function to dispatch the show event
function showOverlay() {
    document.dispatchEvent(showOverlayEvent);
}
// Function to dispatch the hide event
function hideOverlay() {
    document.dispatchEvent(hideOverlayEvent);
}
document.addEventListener('showOverlay', function () {
    document.getElementById('loading-overlay').style.display = 'flex';
});

document.addEventListener('hideOverlay', function () {
    document.getElementById('loading-overlay').style.display = 'none';
});