const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()
const queries = require('./queries')
const connection = require('./knexfile')['development']
const bcrypt = require('bcrypt')
const { response } = require('express')
const db = require('knex')(connection)

const SECRET = 'protalento'

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Listo, mi API esta corriendo')

})
app.get('/users', (req, res) => {
    queries.getAll().then(results => res.send(results))
})

app.post('/users-table', (req, res, next) => {
    console.log(req.body)
    queries.createUser(req.body.username, req.body.password)
        .then(result => {
            res.send(result)
        })
        .catch(error => next(error))
})
app.post('/login', (req, res, next) => {
    db('users-table')
        .where({ username: req.body.username })
        .first()
        .then(user => {
            if (!user) {
                res.status(401).json({
                    error: "No autorizado"
                })
            } else {
                return bcrypt
                    .compare(req.body.password, user.password_digest)
                    .then(isAuth => {
                        if (!isAuth) {
                            res.status(401).json({
                                error: "No autorizado"
                            })
                        } else {
                            return jwt.sign(user, SECRET, (error, token) => {
                                res.status(200).json({ token })
                            })
                        }
                    })

            }
        })
})
app.get('/verify', (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, SECRET, (error, decodedToken) => {
        if (error) {
            res.status(401).json({
                error: "No autorizado"
            })
        } else {
            res.status(200).json({
                id: decodedToken.id,
                username: decodedToken.username
            })
        }
    })
})
app.listen(8000, () => {
    console.log('Running express app')
})