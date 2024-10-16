const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient().$extends({
  model: {
    customer: {
      // TODO: Add register and login methods
      async register(email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
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
