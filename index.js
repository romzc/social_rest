const { connection } = require('./connection/connection');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const publicationRoutes = require('./routes/publication.routes');
const followRoutes = require('./routes/follow.routes');

const port = 3900;
const app = express();
connection()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/user', userRoutes);
app.use('/api/publication', publicationRoutes);
app.use('/api/follow', followRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
