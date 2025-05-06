$(function(){
  function getProfileMetaConfig() {
        const metaTag = document.querySelector('meta[name="admin_config"]');
        if (metaTag) {
          try {
            const content = metaTag.getAttribute("content").replaceAll("'", '"');
            return JSON.parse(content);
          } catch (err) {
            console.error("Error while parsing meta tag config:", err);
          }
        } else {
          console.error('Meta tag with name "admin_config" was not found');
        }
        return {};
    }
    window.config = {
      ...(window.config || {}),
      ...getProfileMetaConfig()
  };
  function formatDateTime(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
  }
  function render(invoices) {
    const pending = invoices.filter(i => i.email === window.config.userEmail && i.status === 'pending');
    const history = invoices.filter(i => i.email === window.config.userEmail && i.status === 'paid');
    pending.forEach(i => $('#pending-body').append(`
      <tr>
        <td>${i.id}</td>
        <td>${(i.amount/100).toFixed(2)}</td>
        <td>${i.currency}</td>
        <td>${formatDateTime(i.createdAt)}</td>
        <td><a href="${i.checkoutUrl}" target="_blank">${vocabulary["Pay"]}</a></td>
      </tr>`));
    history.forEach(i => $('#history-body').append(`
      <tr>
        <td>${i.id}</td>
        <td>${(i.amount/100).toFixed(2)}</td>
        <td>${i.currency}</td>
        <td>${formatDateTime(i.paidAt)}</td>
      </tr>`));
  }

  $.get(window.config.listInvoicesUrl).done(data => render(data.invoices));

  $('.tab-btn').click(function(){
    const tab = $(this).data('tab');
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');
    $('.tab-content').hide();
    $(`#${tab}`).show();
  });
});
