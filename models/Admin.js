const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ticketsBooked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
})

adminSchema.pre('save', function (next) {
    const users = this;
    if (!users.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err)
        }

        bcrypt.hash(users.password, salt, (err, hash) => {
            if (err) {
                return next(err)
            }
            users.password = hash;
            next()
        })
    })

})

adminSchema.methods.comparePassword = function (candidatePassword) {
    const users = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, users.password, (err, isMatch) => {
            if (err) {
                return reject(err)
            }
            if (!isMatch) {
                return reject(err)
            }
            resolve(true)
        })
    })
}

mongoose.model('Admin', adminSchema)