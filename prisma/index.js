const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");
// Creates new instance of Prisma client and extends it with custom methods
// for the customer model
const prisma = new PrismaClient().$extends({
  // Extends the customer model with custom methods for registration and login
  model: {
    customer: {
      // TODO: Add register and login methods
      async register(email, password, saltRounds = 10) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const customer = await prisma.customer.create({
          data: { email, password: hashedPassword },
        });
        return customer;
      },
      async login(email, password) {
        const customer = await prisma.customer.findUniqueOrThrow({
          where: { email },
        });
        const valid = await bcrypt.compare(password, customer.password);
        if (!valid) throw Error("Invalid password");
        return customer;
      },
    },
  },
});

module.exports = prisma;
