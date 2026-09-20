from rest_framework import serializers
from .models import *
from .form_serializers import *


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductByCategorySerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'category',
            'selling_price',
            'discounted_price',
            'quantity',
            'description',
            'brand',
            'product_image'
        ]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CartSerializer(serializers.ModelSerializer):

    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    total_cost = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ["id", "product", "product_id", "quantity", "total_cost"]


class OrderSerializer(serializers.ModelSerializer):

    product = ProductSerializer(read_only=True)
    total_cost = serializers.ReadOnlyField()

    class Meta:
        model = OrderPlaced
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderPlaced
        fields = ['status']
 
    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(valid_statuses)}"
            )
        return value
    
    
class AdminOrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    total_cost = serializers.ReadOnlyField()
 
    class Meta:
        model = OrderPlaced
        fields = "__all__"


class AdminProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "category",
            "category_id",
            "selling_price",
            "discounted_price",
            "quantity",
            "description",
            "brand",
            "product_image",
        ]

    def validate(self, data):
        selling_price = data.get(
            "selling_price", getattr(self.instance, "selling_price", None)
        )
        discounted_price = data.get(
            "discounted_price", getattr(self.instance, "discounted_price", None)
        )
        if (
            selling_price is not None
            and discounted_price is not None
            and discounted_price > selling_price
        ):
            raise serializers.ValidationError(
                "Discounted price cannot exceed selling price."
            )
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']
 
    def validate_name(self, value):
        value = value.strip()
        qs = Category.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "A category with this name already exists."
            )
        return value

class AdminCustomerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)
    order_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "user_id",
            "user_name",
            "email",
            "phone_number",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "zip_code",
            "is_active",
            "date_joined",
            "order_count",
        ]

    def get_order_count(self, obj):
        # OrderPlaced.customer has no related_name set, so Django's default
        # reverse accessor is orderplaced_set.
        return obj.orderplaced_set.count()


class AdminPaymentSerializer(serializers.ModelSerializer):
    # Reuses AdminOrderSerializer (added for the Orders page) so each payment
    # row carries product + customer detail without a second round trip.
    order = AdminOrderSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="order.id", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "notification_type", "message", "order_id", "is_read", "created_at"]