const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config/env");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const requestIdMiddleware = require("./middlewares/request-id.middleware");


const app = express();

app.use(
    cors({
        origin: config.corsOrigin
    })
);

app.use(requestIdMiddleware);

const { apiLimiter } = require("./middlewares/rate-limit.middleware");

app.use(helmet());
app.use(apiLimiter);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

const mainRoutes = require("./routes/main.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const logger = require("./middlewares/logger.middleware");
const errorHandler = require("./middlewares/error.middleware");



app.use(logger);
app.use(express.json({ limit: "10kb" }));

app.use("/", mainRoutes );
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);

app.use(errorHandler);


module.exports = app;