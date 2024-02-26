const { default: mongoose } = require("mongoose");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");

class WalletSystem {
  static async GetAllCustomersWallet() {
    try {
      const response = await CustomerAuthModel.aggregate([
        { $match: {} },
        {
          $project: {
            name: 1,
            email: 1,
            mobileNo: 1,
            wallet: {
              amount: "$wallet.amount",
              expire: {
                $cond: {
                  if: { $lt: ["$wallet.expire", new Date()] },
                  then: "wallet empty",
                  else: "$wallet.expire",
                },
              },
            },
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  static async TopupCustomerWallet({ customerid, topupAmount, validity }) {
    try {
      const findCustomerWallet = await CustomerAuthModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(customerid),
            "wallet.expire": { $gte: new Date() },
          },
        },
      ]);

      //   topup ka logic likho
      //   const monthDate =

      //   const response = await CustomerAuthModel.findByIdAndUpdate(
      //     {
      //       _id: customerid,
      //     },
      //     {}
      //   );
      return { error: false, message: "success", data: findCustomerWallet };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}

module.exports = WalletSystem;
