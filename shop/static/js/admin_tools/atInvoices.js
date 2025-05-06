

$(function() {
    function getAdminMetaConfig() {
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
      ...getAdminMetaConfig()
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

    const csrftoken = $('input[name=csrfmiddlewaretoken]').val();
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!/^GET|HEAD|OPTIONS|TRACE$/.test(settings.type)) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            }
        }
    });
    function loadInvoices() {
        $.get(window.config.listInvoicesUrl)
         .done(resp => {
            $('#invoices-body').empty();
            resp.invoices.forEach(inv => {
                $('#invoices-body').append(`
                  <tr>
                    <td>${inv.id}</td>
                    <td>${inv.email}</td>
                    <td>${(inv.amount/100).toFixed(2)}</td>
                    <td>${inv.currency}</td>
                    <td>${inv.status}</td>
                    <td>${formatDateTime(inv.createdAt)}</td>
                    <td><a href="${inv.checkoutUrl}" target="_blank">Pay</a></td>
                  </tr>
                `);
            });
        })
        .fail((xhr, status, err) => console.error('Load error:', xhr.status, err));
    }
    loadInvoices();

    $('#create-invoice-form').submit(function(e) {
        e.preventDefault();
        let payload = {
            email: $('#userEmail').val(),
            amount: parseInt($('#amount').val()),
            currency: $('#currency').val()
        };
        console.log(window.config.createInvoiceUrl);
        $.ajax({
            url: window.config.createInvoiceUrl,
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            success: function(resp) {
                loadInvoices();
                alert('Invoice created and email sent!');
                $('#create-invoice-form')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error('Error creating invoice:', xhr.status, error, xhr.responseText);
                alert(`Error ${xhr.status}: ${error}\n${xhr.responseText}`);
            }
        });
    });
});
