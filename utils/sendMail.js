
import nodemailer from "nodemailer";


export const sendEmail=async(to,subject,text)=>{

          let config={
            service:process.env.SMPT_SERVICE,
            auth:{
              user:process.env.SMPT_USER,
              pass:process.env.SMPT_PASS
            }
          }

          let transporter=nodemailer.createTransport(config)

          await transporter.sendMail({
                    from:process.env.SMPT_USER,
                    to:to,
                    text:text
          })
}

