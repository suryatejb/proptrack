require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/neighborhoods',  require('./routes/neighborhoods'));
app.use('/api/agents',         require('./routes/agents'));
app.use('/api/buyers',         require('./routes/buyers'));
app.use('/api/properties',     require('./routes/properties'));
app.use('/api/listings',       require('./routes/listings'));
app.use('/api/price-history',  require('./routes/priceHistory'));
app.use('/api/amenities',      require('./routes/amenities'));
app.use('/api/showings',       require('./routes/showings'));
app.use('/api/offers',         require('./routes/offers'));
app.use('/api/contracts',      require('./routes/contracts'));
app.use('/api/inspections',    require('./routes/inspections'));
app.use('/api/reports',        require('./routes/reports'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
