from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.forms import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


STATE_CHOICES = ( ('Andaman and Nicobar Islands', 'Andaman and Nicobar Islands'), ('Andhra Pradesh', 'Andhra Pradesh'), ('Arunachal Pradesh', 'Arunachal Pradesh'), ('Assam', 'Assam'), ('Bihar', 'Bihar'), ('Chandigarh', 'Chandigarh'), ('Chhattisgarh', 'Chhattisgarh'), ('Dadra and Nagar Haveli', 'Dadra and Nagar Haveli'), ('Daman and Diu', 'Daman and Diu'), ('Delhi', 'Delhi'), ('Goa', 'Goa'), ('Gujarat', 'Gujarat'), ('Haryana', 'Haryana'), ('Himachal Pradesh', 'Himachal Pradesh'), ('Jammu and Kashmir', 'Jammu and Kashmir'), ('Jharkhand', 'Jharkhand'), ('Karnataka', 'Karnataka'), ('Kerala', 'Kerala'), ('Ladakh', 'Ladakh'), ('Lakshadweep', 'Lakshadweep'), ('Madhya Pradesh', 'Madhya Pradesh'), ('Maharashtra', 'Maharashtra'), ('Manipur', 'Manipur'), ('Meghalaya', 'Meghalaya'), ('Mizoram', 'Mizoram'), ('Nagaland', 'Nagaland'), ('Odisha', 'Odisha'), ('Puducherry', 'Puducherry'), ('Punjab', 'Punjab'), ('Rajasthan', 'Rajasthan'), ('Sikkim', 'Sikkim'), ('Tamil Nadu', 'Tamil Nadu'), ('Telangana', 'Telangana'), ('Tripura', 'Tripura'), ('Uttar Pradesh', 'Uttar Pradesh'), ('Uttarakhand', 'Uttarakhand'), ('West Bengal', 'West Bengal') ) 

def validate_phone_number(value):
    if len(value) != 10:
        raise ValidationError(_('Phone number must be exactly 10 digits.'))
    if not value.isdigit():
        raise ValidationError(_('Phone number must contain only digits.'))

def validate_zip_code(value):
    if len(value) != 6:
        raise ValidationError(_('Zip code must be exactly 6 digits.'))
    if not value.isdigit():
        raise ValidationError(_('Zip code must contain only digits.'))

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=False)  # Allow duplicate usernames
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Username is required but not unique


class Customer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    user_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=10,unique=True,blank=True, validators=[validate_phone_number])
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, choices=STATE_CHOICES)
    zip_code = models.CharField(max_length=6, validators=[validate_zip_code])

    def __str__(self):
        return self.user_name

class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    
class Product(models.Model):
    title = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(1000)])
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    brand = models.CharField(max_length=255)
    product_image = models.ImageField(upload_to='/')

    def __str__(self):
        return self.title
    


class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(100)])

    def __str__(self):
        return f"{self.quantity} of {self.product.title} for {self.user.username}"
    
    @property
    def total_cost(self):
        return int(self.quantity) * Decimal(self.product.discounted_price)
    
STATUS_CHOICES = (
    ('Pending', 'Pending'),
    ('Accepted', 'Accepted'),
    ('Packed', 'Packed'),
    ('On The Way', 'On The Way'),
    ('Delivered', 'Delivered'),
    ('Cancel', 'Cancel'),
)
class OrderPlaced(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(100)])
    ordered_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    destination = models.TextField()
    received_confirmed = models.BooleanField(default=False)
    received_confirmed_at = models.DateTimeField(null=True, blank=True)
 

    @property
    def total_cost(self):
        return int(self.quantity) * Decimal(self.product.discounted_price)    
    
    def __str__(self):
        return f"Order of {self.quantity} {self.product.title} by {self.user.username}"

class Otp(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.created_at + timezone.timedelta(seconds=60)

    def __str__(self):
        return f"OTP for {self.user}"
    
class Payment(models.Model):

    PAYMENT_MODES = (
        ('UPI', 'UPI'),
        ('Card', 'Card'),
        ('NetBanking', 'NetBanking'),
        ('Cash', 'Cash')
    )

    order = models.ForeignKey(OrderPlaced, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES)

    unique_together = ('order', 'payment_mode')

    def __str__(self):
        return f"Payment for Order {self.order.id}"

from django.conf import settings
from django.db import models


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("order_delivered", "Order Delivered"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    order = models.ForeignKey(
        "OrderPlaced",  # adjust app label if it lives in another app, e.g. "orders.OrderPlaced"
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    notification_type = models.CharField(
        max_length=50, choices=NOTIFICATION_TYPES, default="order_delivered"
    )
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} · {self.notification_type} · Order #{self.order_id}"