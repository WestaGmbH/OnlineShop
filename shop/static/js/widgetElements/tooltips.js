function showTooltip(event, message) {
    const existingTooltip = document.querySelector('.custom-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    // Checking to see if there is an open dialog
    const dialog = document.querySelector('dialog[open]');
    const container = dialog || document.body;

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = message;
    tooltip.style.position = 'absolute';

    if (dialog) {
        // Calculate coordinates relative to the dialog
        const rect = dialog.getBoundingClientRect();
        const offsetY = dialog.scrollTop || 0; // Take into account possible scrolling inside the dialog box
        tooltip.style.left = `${event.clientX - rect.left + 10}px`;
        tooltip.style.top = `${event.clientY - rect.top + 10 + offsetY}px`; // Account for offset and scrolling
    } else {
        // If the tooltip is added to document.body
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    }

    container.appendChild(tooltip);

    // Moving the tooltip with the cursor
    event.target.addEventListener('mousemove', (e) => {
        if (dialog) {
            const rect = dialog.getBoundingClientRect();
            const offsetY = dialog.scrollTop || 0; // Consider scrolling inside the dialog
            tooltip.style.left = `${e.clientX - rect.left + 10}px`;
            tooltip.style.top = `${e.clientY - rect.top + 10 + offsetY}px`;
        } else {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        }
    });

    // Remove the tooltip when the mouse exits
    event.target.addEventListener('mouseleave', () => {
        tooltip.remove();
    });
}
function removeTooltip(){
    const existingTooltip = document.querySelector('.custom-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}