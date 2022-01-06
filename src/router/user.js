const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelEmail } = require('../email/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    // user.save()
    //     .then((result) => {
    //         res.status(201).send(user)
    //     }).catch((err) => {
    //         res.status(400).send(err)
    //         // res.status(400)
    //         // res.send(err)
    //     })

    try {
        const token = await user.generateAuthToken()
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post('/users/login', async (req, res) => {
    // find the user by their credentials (email - password)
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send('Unable to login!')
    }
})

router.post('/users/logout', auth, async (req, res) => {
    // vì nếu login bằng nhiều thiết bị sẽ có nhiều token trong mảng token
    // muốn logout ở một thiết bị thôi thì phải lấy được token của thiết bị hiện tại
    try {
        req.user.tokens = req.user.tokens.filter((item) => { return item.token !== req.token })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// dat middleware auth vao truoc middleware route chinh
router.get('/users/me', auth, async (req, res) => {
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((err) => {
    //     res.status(500).send(err)
    // })
    const user = req.user
    try {
        res.send(user)

    } catch (err) {
        res.status(500).send(err)
    }
})

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     // User.findById(_id).then((user) => {
//     //     if(!user) return res.status(404).send()
//     //     res.send(user)
//     // }).catch((err) => {
//     //     res.status(500).send(err)
//     // })

//     try {
//         const user = await User.findById(_id)
//         if (!user) return res.status(404).send()
//         res.send(user)

//     } catch (err) {
//         res.status(500).send(err)
//     }
// })

router.get('/get-users-by-name', async (req, res) => {
    const query = req.query.name
    // User.find({ name: query })
    //     .then((users) => {
    //         if (users.length == 0) return res.status(404).send()
    //         res.send(users)
    //     }).catch((err) => {
    //         res.status(500).send(err)
    //     })
    try {
        const users = await User.find({ name: query })
        if (users.length == 0) return res.status(404).send()
        res.send(users)
    } catch (err) {
        res.status(500).send(err)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperations = updates.every((item) => {
        return allowedUpdates.includes(item)
    })
    if (!isValidOperations) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        console.log(updates)
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)
    } catch (err) {
        res.status(400).send(err)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (err) {
        res.status(500).send(err)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        // png, jpeg, jpg
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            callback(new Error('Please upload an image file!'))
        }
        callback(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw Error()

        res.set('Content-Type', 'image/jpg') // mac dinh la application/json
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
})
// go len trinh duyet la ra anh http://localhost:3000/users/61d3087a1e054d47e4e57695/avatar

module.exports = router