// // const mongoose = require("mongoose");
// const faker = require("faker");
// const Transaction = require("../models/transaction");

// const generateData = async (numTransactions) => {
//   for (let i = 0; i < numTransactions; i++) {
//     const transaction = new Transaction({
//       user_id: mongoose.Types.ObjectId(),
//       order_id: mongoose.Types.ObjectId(),
//       txn_amount: faker.commerce.price(),
//       txn_status: faker.random.arrayElement(["Pending", "Success", "Failed"]),
//       payment_method: faker.random.arrayElement([
//         "COD",
//         "UPI",
//         "Debit Card",
//         "Credit Card",
//       ]),
//       txn_date: faker.date.recent(),
//       comment: faker.lorem.sentence(),
//       is_active: faker.datatype.boolean(),
//     });

//     await transaction.save();
//   }
//   //   mongoose.connection.close();
// };

// generateData(10);
