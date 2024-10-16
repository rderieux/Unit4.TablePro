const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
// Notice we use {} when importing `authenticate` because it is not the only export
const { authenticate } = require("./auth");

router.get("/", authenticate, async (req, res, next) => {
  // TODO: Send reservations made by the logged in customer
  try {
    const reservations = await prisma.reservation.findMany({
      where: { customerId: req.customer.id },
      include: { restaurant: true },
    });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
});

// TODO: POST /
router.post("/", authenticate, async (req, res, next) => {
  const { partySize, restaurantId } = req.body;
  try {
    const reservation = await prisma.reservation.create({
      data: {
        partySize: +partySize,
        restaurantId: +restaurantId,
        customerId: req.customer.id,
      },
    });
    res.status(201).json(reservation);
  } catch (error) {
    next(error);
  }
});
