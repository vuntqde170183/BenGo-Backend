const mongoose = require('mongoose');

const uri = 'mongodb+srv://kidiezyllex:KK38ly92ncUlJ7qI@bengo.5vjwy6h.mongodb.net/test?appName=bengo';

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB');
    const user = await mongoose.connection.collection('users').findOne({ email: 'vuntqde170183@fpt.edu.vn' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    console.log('User ID:', user._id);
    const driver = await mongoose.connection.collection('drivers').findOne({ userId: user._id });
    if (!driver) {
      console.log('Driver not found');
      process.exit(0);
    }
    console.log('Driver ID:', driver._id);
    
    // Check orders with User._id
    const ordersByUser = await mongoose.connection.collection('orders').find({ driverId: user._id }).toArray();
    console.log(`Orders matching User ID (${user._id}):`, ordersByUser.length);
    
    // Check orders with Driver._id
    const ordersByDriver = await mongoose.connection.collection('orders').find({ driverId: driver._id }).toArray();
    console.log(`Orders matching Driver ID (${driver._id}):`, ordersByDriver.length);
    
    // Check what is considered totalTrips in Driver API (DELIVERED status only via User._id)
    const tripsByUserIdDelivered = await mongoose.connection.collection('orders').find({ driverId: user._id, status: 'DELIVERED' }).toArray();
    console.log(`Delivered Trips matching User ID:`, tripsByUserIdDelivered.length);
    
    // Check in Dispatcher API (Driver._id via driverId)
    const tripsByDriverIdDelivered = await mongoose.connection.collection('orders').find({ driverId: driver._id, status: 'DELIVERED' }).toArray();
    console.log(`Delivered Trips matching Driver ID:`, tripsByDriverIdDelivered.length);

    // Also let's check string vs ObjectId for driverId, maybe driverId was stored as a string sometimes
    const ordersByUserStr = await mongoose.connection.collection('orders').find({ driverId: user._id.toString() }).toArray();
    console.log(`Orders matching User string ID:`, ordersByUserStr.length);
    const ordersByDriverStr = await mongoose.connection.collection('orders').find({ driverId: driver._id.toString() }).toArray();
    console.log(`Orders matching Driver string ID:`, ordersByDriverStr.length);

    process.exit(0);
  })
  .catch(console.error);
