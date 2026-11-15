from rest_framework import serializers
from .models import Category, Product
from django.db import transaction
from .models import Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'size',
            'stock',
            'image_url',
            'created_at',
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'customer_email', 'shipping_address', 'total_amount', 'items', 'created_at']
        read_only_fields = ['total_amount', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            total = 0
            for item_data in items_data:
                product = item_data['product']
                qty = item_data['quantity']
                if product.stock < qty:
                    raise serializers.ValidationError(f"Not enough stock for {product.name}.")
                product.stock -= qty
                product.save()
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=product.price
                )
                total += product.price * qty
            order.total_amount = total
            order.save()
        return order