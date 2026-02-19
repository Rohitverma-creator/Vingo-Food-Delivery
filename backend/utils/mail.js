import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password ",
    html: `<p>Your OTP for password Reset:<b> ${otp} </b> It exipers in 5 minutes</p>`,
  });
};
export const sendDeliveryOtpMail=async(user,otp)=>{
 await transporter.sendMail({
    from: process.env.EMAIL,
    to:user.email,
    subject: "Delivey OTP ",
    html: `<p>Your OTP for delivery is Reset:<b> ${otp} </b> It exipers in 5 minutes</p>`,
  });

}
