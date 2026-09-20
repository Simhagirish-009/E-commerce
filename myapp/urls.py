from django.urls import path
from .form_views import *
from .product_views import *
from .views import *

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

    path("count-cart/",CountCartItemsView.as_view(), name="count-cart-items"),

    path("customer/me/", get_customer, name="get_customer"),
    path("customer/update/", update_customer, name="update_customer"),

    path("search/", search_products, name="search_products"),
    path("cart/buy-all/", PlaceOrderFromCart.as_view(), name="buy-all-cart-items"),

    path("customer/address/", get_customer_profile, name="get-customer-address"),
    path("payment-history/",PaymentHistoryView.as_view(),name="payment-history" ),

    path("admin/orders/", AdminAllOrdersView.as_view(), name="admin-all-orders"),
    path("admin/payments/", AdminAllPaymentsView.as_view(), name="admin-all-payments"),

    path("admin/orders/", AdminAllOrdersView.as_view(), name="admin-all-orders"),
    path("admin/orders/<int:pk>/status/", AdminUpdateOrderStatusView.as_view(), name="admin-update-order-status"),

    path("admin/products/", AdminProductListCreateView.as_view(), name="admin-products"),
    path("admin/products/<int:pk>/", AdminProductDetailView.as_view(), name="admin-product-detail"),
    path("admin/categories/", AdminCategoryListView.as_view(), name="admin-categories"),

    path("admin/categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="admin-category-detail"),

    path("admin/customers/", AdminAllCustomersView.as_view(), name="admin-all-customers"),
    path("admin/payments/", AdminAllPaymentsView.as_view(), name="admin-all-payments"),

    path("orders/<int:pk>/confirm-received/", ConfirmOrderReceivedView.as_view(), name="confirm-order-received"),

    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", MarkNotificationReadView.as_view(), name="notification-mark-read"),

]
