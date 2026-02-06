require("dotenv/config");

module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
