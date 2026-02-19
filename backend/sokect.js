import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("identity", async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true,
          },
          { new: true },
        );

        const activeOrder = await Order.findOne({
          user: userId,
          payment: true,
          "shopOrders.status": { $in: ["out for delivery"] },
        }).populate("shopOrders.assignedDeliveryBoy");

        if (activeOrder) {
          activeOrder.shopOrders.forEach((so) => {
            if (so.assignedDeliveryBoy?.location?.coordinates?.length === 2) {
              io.to(socket.id).emit("updateDeliveryLocation", {
                deliveryBoyId: so.assignedDeliveryBoy._id,
                latitude: so.assignedDeliveryBoy.location.coordinates[1],
                longitude: so.assignedDeliveryBoy.location.coordinates[0],
              });
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("updateLocation", async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
          socketId: socket.id,
        });
        if (user) {
          io.emit("updateDeliveryLocation", {
            deliveryBoyId: userId,
            latitude,
            longitude,
          });
        }
      } catch (error) {
        console.log("update delivery location error", error);
      }
    });
    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          {
            socketId: null,
            isOnline: false,
          },
        );
      } catch (error) {
        console.log(error);
      }
    });
  });
};
