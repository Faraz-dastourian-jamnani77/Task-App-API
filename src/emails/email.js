
const nodemailer = require('nodemailer');
 

const mailTransporter = nodemailer.createTransport({ 
	service: 'gmail', 
	auth: { 
		user: process.env.EMAIL_TASK_APP, 
		pass: process.env.PASSWORD
	} 
}); 

const mailDetails = { 
	from: process.env.EMAIL_TASK_APP, 
	to: '', 
	subject: '', 
	text: ''
}; 



const sendWelcomeEmail = (email,name) =>{
          mailDetails.to = email
          mailDetails.subject = 'Thanks fo joining in!'
          mailDetails.text = `Welcome ${name}.Let us know how you feel`
          mailTransporter.sendMail(mailDetails, function(err, data) { 
                    if(err) { 
                              console.log('Error Occurs',err); 
                    } else { 
                              console.log('Email sent successfully'); 
                    } 
          }); 

}
const canceledEmail = (email,name) =>{
          mailDetails.to = email
          mailDetails.subject = 'Email Cancelation!'
          mailDetails.text = `GoodBye ${name}? I hope to see you soon!!!`
          mailTransporter.sendMail(mailDetails, function(err, data) { 
                    if(err) { 
                              console.log('Error Occurs',err); 
                    } else { 
                              console.log('Email sent successfully'); 
                    } 
          }); 

}




module.exports = {
          sendWelcomeEmail,
          canceledEmail
}












