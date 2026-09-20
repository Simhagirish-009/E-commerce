from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import *
from .product_serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import generics
from django.core.mail import send_mail

class AdminAllOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = OrderPlaced.objects.select_related("product", "user").order_by('-ordered_date')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class AdminAllPaymentsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        payments = Payment.objects.select_related("order").order_by('-payment_date')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

from rest_framework.permissions import IsAdminUser
 
 
class AdminAllOrdersView(APIView):
    permission_classes = [IsAdminUser]
 
    def get(self, request):
        orders = (
            OrderPlaced.objects
            .select_related("product", "user", "customer")
            .order_by('-ordered_date')
        )
        serializer = AdminOrderSerializer(orders, many=True)
        return Response(serializer.data)

class AdminUpdateOrderStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        order = get_object_or_404(OrderPlaced, pk=pk)
        previous_status = order.status

        serializer = OrderStatusUpdateSerializer(
            order, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()

            if previous_status != "Delivered" and order.status == "Delivered":
                self.send_delivery_email(order)

            return Response(AdminOrderSerializer(order).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_delivery_email(self, order):
        customer_email = order.user.email
        if not customer_email:
            return

        subject = f"Your order #{order.id} has been delivered!"
        message = (
            f"Hi {order.user.first_name or order.user.username},\n\n"
            f"Your order #{order.id} for \"{order.product.title}\" "
            f"(qty: {order.quantity}) has been delivered. "
            f"We hope you enjoy it!\n\n"
            f"Total: ₹{order.total_cost}\n\n"
            f"Thanks for shopping with us."
        )

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [customer_email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send delivery email for order {order.id}: {e}")
            return  # don't log a notification for an email that failed to send

        Notification.objects.create(
            user=order.user,
            order=order,
            notification_type="order_delivered",
            message=f"Your order #{order.id} ({order.product.title}) has been delivered.",
        )


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — the logged-in customer's own notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    """PATCH /api/notifications/<pk>/read/ — mark a single notification read."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)


from rest_framework.parsers import MultiPartParser, FormParser


class AdminProductListCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        products = Product.objects.select_related("category").order_by("-id")
        serializer = AdminProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdminProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)

    def get(self, request, pk):
        return Response(AdminProductSerializer(self.get_object(pk)).data)

    def put(self, request, pk):
        product = self.get_object(pk)
        # partial=True: editing an existing product without re-uploading an
        # image shouldn't fail just because product_image wasn't resent.
        serializer = AdminProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        product.delete()
        return Response(
            {"message": "Product deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class AdminCategoryListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        categories = Category.objects.all().order_by("name")
        return Response(CategorySerializer(categories, many=True).data)

class AdminCategoryListView(APIView):
    permission_classes = [IsAdminUser]
 
    def get(self, request):
        categories = Category.objects.all().order_by("name")
        return Response(CategorySerializer(categories, many=True).data)
 
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCategoryDetailView(APIView):
    permission_classes = [IsAdminUser]
 
    def put(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        if Product.objects.filter(category=category).exists():
            return Response(
                {"detail": "Cannot delete a category that still has products in it."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminAllCustomersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        customers = (
            Customer.objects
            .select_related("user")
            .order_by("user_name")
        )
        serializer = AdminCustomerSerializer(customers, many=True)
        return Response(serializer.data)


class AdminAllPaymentsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        payments = (
            Payment.objects
            .select_related("order", "order__product", "order__customer", "order__user")
            .order_by("-payment_date")
        )
        serializer = AdminPaymentSerializer(payments, many=True)
        return Response(serializer.data)

from django.utils import timezone
 
class ConfirmOrderReceivedView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request, pk):
        # user=request.user is the guard here: a customer can only confirm
        # receipt of their own order, never anyone else's.
        order = get_object_or_404(OrderPlaced, pk=pk, user=request.user)
 
        if order.status not in ["On The Way", "Delivered"]:
            return Response(
                {"error": "This order hasn't been marked as shipped yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        if order.received_confirmed:
            return Response(OrderSerializer(order).data)
 
        order.received_confirmed = True
        order.received_confirmed_at = timezone.now()
        if order.status != "Delivered":
            order.status = "Delivered"
        order.save()
 
        return Response(OrderSerializer(order).data)
 