const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const accountModel = require('../models/account-model'); // Adjust the path as needed
const bcrypt = require('bcrypt');

// Configure Local Strategy
passport.use(new LocalStrategy(
    async (email, password, done) => {
        try {
            const user = await accountModel.getAccountByEmail(email);
            if (!user || !(await bcrypt.compare(password, user.account_password))) {
                return done(null, false, { message: 'Incorrect credentials.' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.account_id); // Serialize by account ID
});

// Deserialize user
passport.deserializeUser(async (account_id, done) => {
    try {
        const user = await accountModel.getAccountById(account_id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
