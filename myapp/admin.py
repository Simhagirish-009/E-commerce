from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import *

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'username', 'is_staff', 'is_active']
    search_fields = ['email', 'username']

@admin.register(Customer)
class CustomerModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'user_name', 'phone_number', 'address_line1','address_line2', 'city', 'state', 'zip_code']

@admin.register(Product)
class ProductModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'selling_price', 'discounted_price', 'description', 'brand', 'category','product_image']

@admin.register(Cart)
class CartModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'product_info', 'quantity']
    def product_info(self, obj):
        pass
        # link = reverse("admin:myapp_product_change ", args=[obj.product.pk])
        # return format_html('<a href="{}">{}</a>', link, obj.product.title)

# OTP Model Admin
@admin.register(Otp)
class OtpAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'created_at', 'is_valid')
    search_fields = ('user__email', 'otp')
    list_filter = ('created_at',)
    
@admin.register(OrderPlaced)
class OrderPlacedModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'customer', 'product', 'quantity',
    'ordered_date', 'status']
    # def customer_info(self, obj):
    #     link = reverse("admin:app_customer_change", args=[obj.customer.pk])
    #     return format_html('<a href="{}">{}</a>', link, obj.customer.name)

    # def product_info(self, obj):
    #     link = reverse("admin:app_product_change", args=[obj.product.pk])
    #     return format_html('<a href="{}">{}</a>', link, obj.product.title)

@admin.register(Payment)
class PaymentModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'payment_mode', 'amount', 'payment_date']