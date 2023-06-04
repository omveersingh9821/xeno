const express = require('express');
const passport = require('passport');
const session = require('express-session');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

const User = require('./models/User');
const db = require('./config/mongoose');
const cors = require('cors');
//mongostore
const MongoStore = require('connect-mongo');
const Contact = require('./models/Contact');

// Create an Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors());

// Configure session middleware
app.use(session({
  name:'Authentication',
  secret: 'blahsomething',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  }, 
  store: MongoStore.create(
    {
      mongoUrl: db._connectionString,
      autoRemove: 'disabled',
    },
    function (err) {
      console.log.log(err || 'connect mongo setup ok')
    }
  )
  
}));


// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('/home', (req, res) => {
  console.log(req.user)
  if (req.user) {
    res.status(200).json({
      user: req.user,
    });
  } else {
    res.status(401).json({
      message: 'Not authorized',
    });
  }
});

app.get('/contacts', async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findOne({ username: req.user.username }).populate('contacts');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({
        contacts: user.contacts,
      });
    } else {
      res.status(401).json({
        message: 'Not authorized',
      });
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Add a contact
app.post('/add/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const contactData = req.body;
    console.log(contactData,username)

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contact = await Contact.create(contactData)
    user.contacts.push(contact);
    await user.save();

    res.status(201).json({ message: 'Contact added successfully', contact });
      
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a contact
app.delete('/delete/:username/:contactId', async (req, res) => {
  try {
    const { username, contactId } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contactIndex = user.contacts.findIndex(
      (contact) => contact._id.toString() === contactId
    );
    console.log(contactIndex)

    if (contactIndex === -1) {
      return res.status(404).json({ message: 'Contact not found' });
    }


    user.contacts.splice(contactIndex, 1);
    await Contact.findByIdAndDelete(contactId)
    await user.save();

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a contact
app.post('/update/:username/:contactId', async (req, res) => {
  try {
    if (req.user) {
      const { contactId, username } = req.params;
      const updatedData = req.body;
      
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const contact = user.contacts.find((contact) => contact._id.equals(contactId));

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      const cont = await Contact.findByIdAndUpdate(contact,updatedData)
      console.log(cont)
      await user.save();

      res.json({ message: 'Contact updated successfully', contact });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'https://647c751033068024852c972a--dreamy-crostata-c2305f.netlify.app/',
    failureRedirect: '/login',
  })
);


// Start the server
app.listen(4000, () => {
  console.log('Server started on port 4000');
});





