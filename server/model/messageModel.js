const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000 // Mesaj uzunluğunu sınırla
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String, 
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Mesajın yaşam süresi için TTL
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: '24h' }
  }
});

// Kanal başına mesaj sayısını sınırlamak için bileşik index
messageSchema.index({ channel: 1, createdAt: -1 });

// Mesaj oluştuktan sonra işleme hook'u
messageSchema.post('save', async function(doc) {
  try {
    // Her kanalda en son 50 mesajı tut, gerisini sil
    const Message = mongoose.model('Message');
    const count = await Message.countDocuments({ channel: doc.channel });
    
    if (count > 50) {
      const messagesToDelete = await Message.find({ channel: doc.channel })
        .sort({ createdAt: 1 })
        .limit(count - 50);
        
      if (messagesToDelete.length > 0) {
        await Message.deleteMany({ 
          _id: { $in: messagesToDelete.map(msg => msg._id) }
        });
      }
    }
  } catch (error) {
    console.error('Eski mesajları temizleme hatası:', error);
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message; 