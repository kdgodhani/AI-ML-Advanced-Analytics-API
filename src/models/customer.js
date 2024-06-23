const mongoose = require('mongoose');
const { Schema } = mongoose;


const customerSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shipping_address: {
        type: String,
        required: true
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],

},
{
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});


const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
