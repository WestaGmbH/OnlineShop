import logging

import json
import stripe
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.mail import send_mail, EmailMessage
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.utils.translation import gettext as _
from django.views.generic import TemplateView

from OnlineShop import settings
from shop.views import is_admin, invoices_ref
from firebase_admin import firestore as _fs

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

@login_required
@user_passes_test(is_admin)
@require_POST
def create_invoice(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    data = json.loads(request.body)
    user_email = data.get('email')
    amount = data.get('amount')
    currency = data.get('currency')
    if not user_email or not amount or not currency:
        return HttpResponseBadRequest('Missing fields')

    domain_url = 'https://www.oliverweber.online/'
    if settings.CURRENT_DOMAIN == "oliverweber.com":
        domain_url = 'https://www.oliverweber.com/'
    elif settings.CURRENT_DOMAIN == "oliverweber.online":
        domain_url = 'https://www.oliverweber.online/'

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                'price_data': {
                    'currency': currency,
                    'product_data': {'name': f"Invoice for {user_email}"},
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=domain_url + 'invoice/success/',
            cancel_url=domain_url + 'invoice/cancelled/',
            metadata={'email': user_email},
        )
    except Exception as e:
        logger.error(f"Stripe session creation failed: {e}")
        return HttpResponse(status=500, content="Stripe session creation error")


    invoice_reference = invoices_ref.document()
    invoice_reference.set({
        'email': user_email,
        'amount': amount,
        'currency': currency,
        'status': 'pending',
        'stripeSessionId': session.id,
        'checkoutUrl': session.url,
        'createdAt': _fs.SERVER_TIMESTAMP,
    })

    # 3) Send email with link
    subject_1 = _("Your invice:")
    body_1 = _("Pay using this link:")
    email = EmailMessage(
        subject=subject_1+f" {amount/100:.2f} {currency}",
        body=f"""{body_1} {session.url}""",
        from_email=settings.EMAIL_HOST_USER,
        to=[user_email],
    )
    email.send()
    logger.info("Customer invoice email sent successfully")

    return JsonResponse({'invoiceId': invoice_reference.id, 'checkoutUrl': session.url})

@require_GET
def list_invoices(request):
    docs = invoices_ref.stream()
    invoices = []
    for doc in docs:
        inv = doc.to_dict()
        inv['id'] = doc.id
        inv['createdAt'] = inv['createdAt'].isoformat() if inv.get('createdAt') else None
        inv['paidAt'] = inv['paidAt'].isoformat() if inv.get('paidAt') else None
        invoices.append(inv)
    return JsonResponse({ 'invoices': invoices })

class InvoiceSuccessView(TemplateView):
    """
    Stripe success page
    """
    template_name = 'stripe/successInvoice.html'



class InvoiceCancelledView(TemplateView):
    """
    Stripe cancelled page
    """
    template_name = 'stripe/cancelledInvoice.html'


