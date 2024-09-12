const mongoose = require('mongoose');

// Define the Order Schema
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to a User model
        required: true
    },
    userName: {
        type: String,
    },

    cartItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Reference to a Product model
                required: true
            },
            image: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    address: {
        address: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cod'], // Specify payment methods
        required: true
    },
    orderSummary: {
        subTotal: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        shipping: {
            type: String,
            default: 'FREE'
        },
        total: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    paymentId: {
        type: String
    },
    paymentStatus: {
        type: String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveryStatus: {
        type: String,
        default: 'Pending'
    },
    deliveredAt: {
        type: Date
    },
    orderNumber: {
        type: String,
        default: function() {
            return generateOrderNumber();
          }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

function generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now(); // Current timestamp
    const randomNumber = Math.floor(Math.random() * 10000); // Random number
    return `${prefix}-${timestamp}-${randomNumber}`;
  }

// Create and export the Order model
module.exports = mongoose.model('Orders', orderSchema);
