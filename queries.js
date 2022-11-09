const connection = require('./knexfile')['development']
const bcrypt = require('bcrypt')
const db = require('knex')(connection)


module.exports = {
  getAll() {
    return db('users')
  },
  createUser(username, password) {
    bcrypt.hash(password, 10)
      .then(hashedPassword => {
        return (
          db('users-table').insert({
            username: username,
            password_digest: hashedPassword
          })
        )
      })
  }

}