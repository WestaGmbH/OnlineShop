const metaTag = document.querySelector('meta[name="gtm-config"]');
if (metaTag) {
    window.gtmConfigId = metaTag.getAttribute('content');
} else {
    console.error('Meta tag with name "gtm-config" not found.');
}

window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage':       'denied'
});
gtag('js', new Date());
gtag('config', window.gtmConfigId);