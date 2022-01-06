const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    // task.save()
    //     .then((result) => {
    //         res.status(201).send(task)
    //     })
    //     .catch((err) => {
    //         res.status(400).send(err)
    //     })
    try {
        await task.save()
        res.status(201).send(task)

    } catch (err) {
        res.status(400).send(err)
    }
})

// Filtering: GET /tasks?completed=true
// Pagignation: GET /tasks?limit=2&skip=0 (trang1) limit=2&skip=2 (trang2) limit=2&skip=4 (trang3)
// Sorting: GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    const sort = {}
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    
    try {
        // const tasks = await Task.find({ owner: req.user._id, completed: req.query.completed})
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),  // tren url la string -> integer
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (err) {
        res.status(500).send(err)
    }
})


router.get('/tasks/:id', auth, async (req, res) => {
    // Task.findById(_id).then(task => {
    //     if (!task) return res.status(404).send()
    //     res.send(task)
    // }).catch((err) => {
    //     res.status(500).send(err)
    // })

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if(!task) return res.status(404).send({error: 'Unable find this task'})
        res.send(task)
        
    } catch (err) {
        res.status(500).send(err)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperations = updates.every((item) => {
        return allowedUpdates.includes(item)
    })
    if(!isValidOperations) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task) return res.status(404).send({ error: "Unable to find any task with that id" });

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        
        res.send(task) 
    } catch (err) {
        res.status(500).send(err)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        })
        if(!task) return res.status(404).send({ error: "Not found this task! "})
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router