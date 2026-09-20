from .form_serializers import *
from .product_serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product
from .product_serializers import *
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.decorators import api_view

def format_destination(address):
    if not address:
        return ""

    return f"{address.get('address_line')}, {address.get('city')}, {address.get('state')} - {address.get('zip_code')}"


class ProductsByCategoryView(APIView):
    permission_classes = [IsAuthenticated]  # Allow unrestricted access
    def get(self, request):
        products = Product.objects.select_related('category').order_by('category__name')
        serializer = ProductByCategorySerializer(products, many=True)
        return Response(serializer.data)
    
from django.shortcuts import get_object_or_404

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        product = get_object_or_404(Product, id=product_id)

        if quantity > product.quantity:
            return Response({"error": "Exceeds available stock"}, status=400)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product
        )

        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity

        cart_item.save()



        return Response(CartSerializer(cart_item).data)

# VIEW USER CART
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(cart, many=True)

        return Response(serializer.data)


class UpdateCartView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        cart_item = get_object_or_404(Cart, id=pk, user=request.user)

        quantity = request.data.get("quantity")

        if quantity:
            cart_item.quantity = int(quantity)  # ✅ FIX
            cart_item.save()

        return Response(CartSerializer(cart_item).data)

# DELETE FROM CART
class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        cart_item = get_object_or_404(Cart, id=pk, user=request.user)
        cart_item.delete()

        return Response({"message": "Item removed from cart"})
    
class BuyProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        address = request.data.get("address")  # ✅ get address

        product = get_object_or_404(Product, id=product_id)

        if quantity > product.quantity:
            return Response({"error": "Exceeds available stock"}, status=400)

        customer = get_object_or_404(Customer, user=request.user)

        # ✅ format destination
        destination = format_destination(address)

        # ✅ reduce stock
        product.quantity -= quantity
        product.save()

        order = OrderPlaced.objects.create(
            user=request.user,
            customer=customer,
            product=product,
            quantity=quantity,
            destination=destination  # ✅ save here
        )

        return Response(OrderSerializer(order).data)

from django.db import transaction

class PlaceOrderFromCart(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        cart_items = Cart.objects.select_related("product").filter(user=request.user)

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        customer = get_object_or_404(Customer, user=request.user)
        address = request.data.get("address")  # ✅ get address
        destination = format_destination(address)

        orders = []

        with transaction.atomic():

            # ✅ Validate stock first
            for item in cart_items:
                if item.quantity > item.product.quantity:
                    return Response(
                        {"error": f"{item.product.title} out of stock"},
                        status=400
                    )

            # ✅ Create orders + reduce stock
            for item in cart_items:
                product = item.product

                product.quantity -= item.quantity
                product.save()

                order = OrderPlaced.objects.create(
                    user=request.user,
                    customer=customer,
                    product=product,
                    quantity=item.quantity,
                    destination=destination  # ✅ same destination for all
                )

                orders.append(order)

            cart_items.delete()

        return Response(OrderSerializer(orders, many=True).data)
    
    
from django.shortcuts import get_object_or_404

class MakePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        order_id = request.data.get("order_id")
        payment_mode = request.data.get("payment_mode")

        order = get_object_or_404(
            OrderPlaced, id=order_id, user=request.user
        )

        # ✅ Check if this product exists in cart
        cart_item = Cart.objects.filter(
            user=request.user,
            product=order.product
        ).first()

        # 🔥 If exists → handle conversion
        if cart_item:
            # OPTION 1: If quantities match → delete
            if cart_item.quantity == order.quantity:
                cart_item.delete()

            # OPTION 2: If cart has more → reduce quantity
            elif cart_item.quantity > order.quantity:
                cart_item.quantity -= order.quantity
                cart_item.save()

            # OPTION 3: If order quantity > cart (rare case)
            else:
                cart_item.delete()

        # ✅ Create Payment
        payment = Payment.objects.create(
            order=order,
            amount=order.total_cost,
            payment_mode=payment_mode
        )

        return Response({
            "message": "Payment Successful",
            "payment": PaymentSerializer(payment).data
        })
    
class PaymentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        payments = Payment.objects.filter(order__user=request.user)

        serializer = PaymentSerializer(payments, many=True)

        return Response(serializer.data)
    
class CountCartItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart_count = Cart.objects.filter(user=request.user).count()

        return Response({"cart_count": cart_count})
    
class UserOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = OrderPlaced.objects.filter(user=request.user).order_by('-ordered_date')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
@api_view(["GET"])
def search_products(request):
    query = request.GET.get("q", "")

    if not query:
        return Response([])

    products = Product.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(brand__icontains=query) |
        Q(category__name__icontains=query)
    ).select_related("category")

    return Response(ProductSerializer(products, many=True).data)


@api_view(["GET"])
def get_customer_profile(request):
    customer = get_object_or_404(Customer, user=request.user)
    serializer = ViewCustomerSerializer(customer)
    return Response(serializer.data)
