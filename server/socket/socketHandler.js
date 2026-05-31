const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins a room named after their userId
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`User ${userId} joined their personal room`);
      }
    });

    // User joins a room named after their city
    socket.on('join_city', (city) => {
      if (city) {
        const cleanCity = city.trim().toLowerCase();
        socket.join(cleanCity);
        console.log(`Socket ${socket.id} joined city room: ${cleanCity}`);
      }
    });

    // Clean up on disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
