const Order = require('../../model/Orders/index');

// Create a new order
exports.createOrder = async (req, res) => {
    console.log(req.body);
    // try {
    //     const { user, cartItems, address, paymentMethod, orderSummary } = req.body;

    //     if (!user || !cartItems || !address || !paymentMethod || !orderSummary) {
    //         return res.status(400).json({ 
    //             message: 'Missing required fields',
    //             success: false
    //         });
    //     }

    //     // Validate user ID (ensure it's a valid ObjectId)
    //     if (!mongoose.Types.ObjectId.isValid(user)) {
    //         return res.status(400).json({ 
    //             message: 'Invalid user ID',
    //             success: false
    //         });
    //     }

    //     // Calculate total price
    //     const subTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    //     const total = subTotal - (orderSummary.discount || 0);
        
    //     const order = new Order({
    //         user,
    //         cartItems,
    //         address,
    //         paymentMethod,
    //         orderSummary: {
    //             subTotal,
    //             discount: orderSummary.discount || 0,
    //             shipping: orderSummary.shipping || 'Free',
    //             total
    //         }
    //     });

    //     const savedOrder = await order.save();
    //     res.status(200).json({
    //         message: 'Order created successfully',
    //         order: savedOrder,
    //         success: true
    //     });

    // } catch (error) {
    //     console.error('Error creating order:', error);
    //     res.status(500).json({ 
    //         message: 'Error creating order',
    //         error: error.message,
    //         success: false
    //     });
    // }
};
