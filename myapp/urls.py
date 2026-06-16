from django.urls import path
from .form_views import *
from .product_views import *

urlpatterns = [

    # Form authentication endpoints
    path('login/', login, name='login'),
    path('verify-otp/', VerifyOtpView.as_view(), name='verify-otp'),
    path('register/', PartialRegisterView.as_view(), name='register'),
    path('complete-profile/', CompleteProfileView.as_view(), name='complete-profile'),
    path('is-complete/', IsCompleteProfileView.as_view(), name='is-complete'),
    path("states/", StateListView.as_view(), name="state-list"),

    # Product Management endpoints
    path('products-by-category/', ProductsByCategoryView.as_view(), name='products-by-category'),

    # CART endpoints
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/add/", AddToCartView.as_view(), name="add-to-cart"),
    path("cart/update/<int:pk>/", UpdateCartView.as_view(), name="update-cart"),
    path("cart/remove/<int:pk>/", RemoveCartItemView.as_view(), name="remove-cart"),

    # BUY  ENDPOINTS
    path("buy/", BuyProductView.as_view(), name="buy-product"),
    path("buy-cart/", PlaceOrderFromCart.as_view(), name="buy-cart"),
    path('orders/', UserOrdersView.as_view(), name='user-orders'),

    # Payment endpoints
    path("payment/", MakePaymentView.as_view(), name="make-payment"),
    path("payments/history/", PaymentHistoryView.as_view(), name="payment-history"),

    path("count-cart/",CountCartItemsView.as_view(), name="count-cart-items"),

    path("customer/me/", get_customer, name="get_customer"),
    path("customer/update/", update_customer, name="update_customer"),

    path("search/", search_products, name="search_products"),
    path("cart/buy-all/", PlaceOrderFromCart.as_view(), name="buy-all-cart-items"),

    path("customer/address/", get_customer, name="get-customer-address"),
    path("payment-history/",PaymentHistoryView.as_view(),name="payment-history" )

]
