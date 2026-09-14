const logger = (req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
        const responseTime = Date.now() - startTime;

        console.log({
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`
        });
    });

    next();
};

module.exports = logger;