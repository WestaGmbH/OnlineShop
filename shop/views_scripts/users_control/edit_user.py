import json

from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.shortcuts import render

from shop.views import users_ref, is_admin, update_email_in_db, currency_dict, groups_dict, \
    serialize_firestore_document, get_user_prices, get_currency_symbol


@login_required
@user_passes_test(is_admin)
def edit_user(request, user_id):
    email = request.user.email
    category, currency_code = get_user_prices(request, email)
    currency_symbol = get_currency_symbol(currency_code)
    existing_user_query = users_ref.where('userId', '==', int(user_id)).limit(1)
    existing_user_stream = existing_user_query.stream()
    existing_user_list = list(existing_user_stream)

    if not existing_user_list:
        return JsonResponse({'status': 'error', 'message': 'User not found in Firestore.'}, status=404)

    existing_user = existing_user_list[0]

    existing_user_data = serialize_firestore_document(users_ref.document(existing_user.id).get())

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            old_user_data = json.loads(data.get('old', '{}'))
            new_user_data = data.get('new', {})

            old_email = old_user_data.get('email')
            new_email = new_user_data.get('email')
            new_password = new_user_data.get('password')

            if new_email and new_email != old_email:
                existing_user_with_new_email = users_ref.where('email', '==', new_email).limit(1).get()
                if existing_user_with_new_email:
                    return JsonResponse({'status': 'error', 'message': 'User with this email already exists.'},
                                        status=400)

            User = get_user_model()
            try:
                user_instance = User.objects.get(email=old_email)
                updated=False
                # Update email if it has changed

                if new_email and new_email != old_email:
                    user_instance.username = new_email
                    user_instance.email = new_email
                    try:
                        update_email_in_db(old_email, new_email)
                    except Exception as e:
                        return JsonResponse(
                            {'status': 'error', 'message': 'Error updating email in Firestore.'},
                            status=500)
                    updated = True

                # Update the password, if provided
                if new_password:
                    try:
                        validate_password(new_password, user_instance)
                        user_instance.set_password(new_password)
                        updated = True
                    except ValidationError as e:
                        return JsonResponse({'status': 'error', 'message': list(e.messages)}, status=400)

                if updated:
                    user_instance.save()  # Save the changes in the database

            except User.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'User not found.'}, status=404)
            if 'id_gender' in new_user_data:
                social_title = "Mr" if new_user_data.get('id_gender')=="1" else "Mrs"
            else:
                social_title = old_user_data.get('social_title', "Mr")
            receive_offers = new_user_data.get('receive-partners-offers') == "1"
            user_enabled = new_user_data.get('enable-user') == "1"
            show_quantities = new_user_data.get('show-quantities') == "1"
            is_b2b = new_user_data.get('is-b2b') == "1"
            customer_type = "B2B" if is_b2b else "Customer"
            can_b2b_pay = is_b2b and new_user_data.get('can-b2b') == "1"

            customer_currency = currency_dict.get(new_user_data.get('id_currency'))
            customer_group = groups_dict.get(new_user_data.get('id_group'))

            if customer_group and customer_group in ["Default", "Default_USD"]:
                sale = int(new_user_data.get('sale', 0))
                modifier = int(new_user_data.get('price_modifier', 0))
            else:
                sale = 0
                modifier = 0

            firestore_update_data = {
                'Enabled': user_enabled,
                'social_title': social_title,
                'first_name': new_user_data.get('firstname'),
                'last_name': new_user_data.get('lastname'),
                'email': new_user_data.get('email'),
                'birthday': new_user_data.get('birthday'),
                'agent_number': new_user_data.get('client-name'),
                'currency': customer_currency,
                'receive_offers': receive_offers,
                'price_category': customer_group,
                'sale': sale,
                'price_modifier': modifier,
                'show_quantities': show_quantities,
                'customer_type': customer_type,
                'b2b_can_pay': can_b2b_pay,
            }

            existing_user.reference.update(firestore_update_data)
            return JsonResponse({'status': 'success', 'message': 'Address updated successfully.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    context = {
        'feature_name': "edit_user",
        'currency': currency_symbol,
        'user_info': existing_user_data,
        'user_info_dict': json.dumps(existing_user_data)
    }

    return render(request, 'admin_tools.html', context)
