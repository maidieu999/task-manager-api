const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// const msg = {
//     to: 'vuthimaidieu914@gmail.com', // Change to your recipient
//     from: '030234180019@st.buh.edu.vn', // Change to your verified sender
//     subject: 'Sending with SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//   }
//   sgMail
//     .send(msg)
//     .then(() => {
//       console.log('Email sent')
//     })
//     .catch((error) => {
//       console.error(error)
//     })

const sendWelcomeEmail = (email, username) => {
  const msg = {
    to: email, // Change to your recipient
    from: '030234180019@st.buh.edu.vn', // Change to your verified sender
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${username}. Let me know how you get along with the app.`,
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Welcome mail sended')
    })
    .catch((error) => {
      console.error('Error when sending welcome email: ', error)
    })
}

const sendCancelEmail = (email, username) => {
  const msg = {
    to: email,
    from: '030234180019@st.buh.edu.vn',
    subject: 'Sorry to see you go',
    text: `Goodbye, ${username}. I hope to see you back sometime soon.`
  }
  sgMail.send(msg)
    .then(() => {
      console.log('Cancel email sended!')
    })
    .catch((err)=> {
      console.log('Error when sending cancel emai: ', err)
    })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail
}