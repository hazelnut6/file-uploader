const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function(passport) {
    // LocalStrategy
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, async(username, password, done) => {
            try {
                // find user
                const user = await prisma.user.findUnique({
                    where: {
                        username: username,
                    },
                });

                // Does user exists?
                if(!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }

                // Compare password to hashed password
                const match = await bcrypt.compare(password, user.password);

                // Check if password match
                if(!match) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                // no error, return user
                return done(null, user);
            } catch(err) {
                console.error('LocalStrategy error:', err);
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id: id,
                },
            });
            done(null, user);
        } catch(err) {
            done(err, null);
        }
    });
};