const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Task Manager API",
            version: "1.0.0",
            description:
                "A production-oriented Task Manager REST API built with Node.js, Express, and MongoDB"
        },

        servers: [
            {
                url: "http://localhost:5000",
                description: "Local development server"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: [
        "./src/docs/*.swagger.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;