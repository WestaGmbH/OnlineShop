function getScriptConfig() {
    const configScript = document.getElementById('config-data');
    if (configScript) {
      try {
        return JSON.parse(configScript.textContent);
      } catch (err) {
        console.error("Error when parsing meta tag config:", err);
      }
    } else {
      console.error('Element with id "config-data" was not found');
    }
    return {};
}
function getMergedConfig() {
    const scriptConfig = getScriptConfig();
    return {...scriptConfig };
}
window.config = {
  ...(window.config || {}),
  ...getMergedConfig()
};

let product_documents = [];
function initializeContent() {
    product_documents = window.config.documents;
    calculate_final(0,0, currency, product_documents);
}
document.addEventListener("DOMContentLoaded", function() {
     isCheckout = true;
     initializeContent();
});
document.getElementById("section1").addEventListener("change", toggleSections);
document.getElementById("section2").addEventListener("change", toggleSections);

function toggleSections(){

    const section1 = document.getElementById("wrapper");
    const section2 = document.getElementById("wrapper2");
    section1.classList.toggle("section-hidden");
    section2.classList.toggle("section-hidden");
}

const labels = document.querySelectorAll('.labels label');
const underline = document.querySelector('.underline');

function moveUnderline(element) {
    underline.style.width = element.offsetWidth + 'px';
    underline.style.left = element.offsetLeft + 'px';
}

labels.forEach(label => {
    label.addEventListener('click', function() {
        moveUnderline(label);
    });
});

moveUnderline(document.querySelector('label[for="section1"]'));