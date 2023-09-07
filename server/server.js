require("dotenv").config();
const express = require("express");
const path = require("path");

const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const http = require("http");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();
  server.applyMiddleware({ app });

  // if we're in production, serve client/build as static assets

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API Server Running on localhost:${PORT}`);
      console.log(
        `Use GraphQl at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
}

startApolloServer(typeDefs, resolvers);
