const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function(passport) {
    // LocalStrategy
    passport.use(
        new LocalStrategy({ usernameField: 'username', passReqToCallback: true  }, async(req, username, password, done) => {
            try {
                // find user
                const user = await prisma.user.findUnique({
                    where: {
                        username: username,
                    },
                });

                // Does user exists?
                if(!user) {
                    req.flash('error', 'Incorrect username.');
                    return done(null, false);
                }

                // Compare password to hashed password
                const match = await bcrypt.compare(password, user.password);

                // Check if password match
                if(!match) {
                    req.flash('error', 'Incorrect password.');
                    return done(null, false);
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
