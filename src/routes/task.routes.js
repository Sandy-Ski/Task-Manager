const express = require("express");

const router = express.Router();

const { 
        createTask, getTasks, getTaskById,
        updateTask, deleteTask,bulkDeleteTasks,    
        restoreTask,bulkUpdateTasks,getTaskStats
    } = require("../controllers/task.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validate.middleware");

const { createTaskValidation, updateTaskValidation,
      getTasksValidation, bulkUpdateTasksValidation,
      bulkDeleteTasksValidation } 
    = require("../validators/task.validator");




router.post(
    "/",
    authMiddleware,
    validate(createTaskValidation),
    createTask
);

router.get(
    "/",
    authMiddleware,
    validate(getTasksValidation),
    getTasks
);

router.get("/stats", authMiddleware, getTaskStats);


router.patch(
    "/bulk",
    authMiddleware,
    validate(bulkUpdateTasksValidation),
    bulkUpdateTasks
);

router.delete(
    "/bulk",
    authMiddleware,
    validate(bulkDeleteTasksValidation),
    bulkDeleteTasks
);


router.get(
    "/:id",
    authMiddleware,
    getTaskById
);

router.patch(
    "/:id",
    authMiddleware,
    validate(updateTaskValidation),
    updateTask
);



router.delete("/:id", authMiddleware, deleteTask);

router.post(
    "/:id/restore",
    authMiddleware,
    restoreTask
);


module.exports = router;
