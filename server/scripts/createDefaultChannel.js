const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Channel = require('../model/channelModel');
const User = require('../model/userModel');


dotenv.config();


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const createDefaultChannel = async () => {
  try {

    const existingChannel = await Channel.findOne({ name: 'Genel Sohbet' });
    
    if (existingChannel) {
      console.log('Genel kanal zaten mevcut:', existingChannel);
      process.exit(0);
    }
    

    let adminUser = await User.findOne({ email: 'admin@teamsync.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@teamsync.com',
        password: 'admin123'
      });
      console.log('Admin kullanıcısı oluşturuldu');
    }
    

    const generalChannel = await Channel.create({
      name: 'Genel Sohbet',
      description: 'Herkesin konuşabileceği genel kanal',
      creator: adminUser._id,
      members: [adminUser._id]
    });
    
    console.log('Genel kanal oluşturuldu:', generalChannel);
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

createDefaultChannel(); 