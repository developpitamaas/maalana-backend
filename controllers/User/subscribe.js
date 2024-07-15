// const Subscribe = require("../../model/User/Subscribe");
// const TryCatch = require("../../middleware/Trycatch");
// const NodeCache = require("node-cache");
// const cache = new NodeCache();
// const logo = require("./SK Foods Logo 3.png");
// // create subscribe
// const CreateSubscribe = TryCatch(async (req, res, next) => {
//   const subscribe = await Subscribe.create(req.body);
//   cache.del("subscribe");
//   res.status(201).json({
//     success: true,
//     message: "congratulations, you have subscribed successfully",
//   });
// });

// // get all subscribe
// const GetAllSubscribe = TryCatch(async (req, res, next) => {
  
//   // check cache
//   if (cache.has("subscribe")) {
//     const subscribe = cache.get("subscribe");
//     return res.status(200).json({
//       success: true,
//       subscribe,
//     });
//   } else {
//     const subscribe = await Subscribe.find();
//     cache.set("subscribe", subscribe, 10);
//     res.status(200).json({
//       success: true,
//       subscribe,
//     });
//   }
 
// })



// // export
// module.exports = {
//   CreateSubscribe,
//   GetAllSubscribe
// };

const Subscribe = require("../../model/User/Subscribe");
const TryCatch = require("../../middleware/Trycatch");
const NodeCache = require("node-cache");
const sendEmail = require("../../utils/sendmail"); // Import the sendEmail function
const cache = new NodeCache();


// create subscribe
const CreateSubscribe = TryCatch(async (req, res, next) => {
  const subscribe = await Subscribe.create(req.body);
  cache.del("subscribe");

  // Send a subscription email
  const email = req.body.email;
  const subject = "Welcome to SK Food!"; 
  const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dzvsrft15/image/upload/v1719375540/SK_Foods_Logo_3_m3hn2q.png" alt="SK Food Logo" style="width: 100px; height: auto;" />
        <h1 style="color: #333;">Welcome to SK Food!</h1>
      </div>
      <p>Dear Customer,</p>
      <p>Congratulations, you have subscribed successfully to SK Food! We're thrilled to have you with us.</p>
      <p>At SK Food, we are dedicated to bringing you the best and freshest food products. Stay tuned for exciting updates, exclusive offers, and delicious recipes straight to your inbox.</p>
      <p>Thank you for joining our community. We look forward to serving you!</p>
      <p>Best Regards,</p>
      <p><strong>SK Food Team</strong></p>
      <p style="font-size: 0.8em; color: #666;">If you did not subscribe to this newsletter or wish to unsubscribe, please click here.</p>
    </div>
  `;

  await sendEmail(email, subject, message, true); // Send HTML email

  res.status(201).json({
    success: true,
    message: "Congratulations, you have subscribed successfully",
  });
});

// get all subscribe
const GetAllSubscribe = TryCatch(async (req, res, next) => {
  
  // check cache
  if (cache.has("subscribe")) {
    const subscribe = cache.get("subscribe");
    return res.status(200).json({
      success: true,
      subscribe,
    });
  } else {
    const subscribe = await Subscribe.find();
    cache.set("subscribe", subscribe, 10);
    res.status(200).json({
      success: true,
      subscribe,
    });
  }
})

// export
module.exports = {
  CreateSubscribe,
  GetAllSubscribe
};
