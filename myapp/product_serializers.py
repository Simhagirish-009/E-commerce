from rest_framework import serializers
from .models import *


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

