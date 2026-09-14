const mongoose = require("mongoose");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const ApiResponse = require("../utils/api-response");

const {
    createTaskService,getTasksService,
    getTaskByIdService, updateTaskService,
    deleteTaskService, bulkDeleteTasksService,
    restoreTaskService,bulkUpdateTasksService,
    getTaskStatsService
} = require("../services/task.service");





const createTask = asyncHandler(async (req, res) => {

    const { title, description, completed,
         priority, dueDate, tags, category, reminder, recurring} = req.body;


    const normalizedPriority = priority === undefined
             ? undefined
             :priority.trim().toLowerCase();

    const normalizedTags = tags
        ? [...new Set(
            tags.map((tag) => tag.trim().toLowerCase())
        )]
        : [];

    let normalizedRecurring = recurring;

    if (recurring !== undefined) {
        normalizedRecurring = {
            ...recurring,
            frequency: recurring.frequency === undefined
                ? undefined
                : recurring.frequency.trim().toLowerCase()
        };
    }

    const newTask = await createTaskService({
        title,
        description,
        completed,
        priority: normalizedPriority,
        dueDate,
        tags: normalizedTags,
        category,
        reminder,
        recurring: normalizedRecurring,
        userId: req.user.userId
    });

    res.status(201).json(
        new ApiResponse(
            201,
            newTask,
            "Task created successfully"
        )
    );

});

const getTasks = asyncHandler(async (req, res) => {

    const page = req.query.page === undefined
        ? 1
        : Number(req.query.page);

    const limit = req.query.limit === undefined
        ? 10
        : Number(req.query.limit);

    const sort = (req.query.sort || "oldest").toLowerCase();


    const sortOrder = sort === "oldest" ? 1 : -1;

    const skip = (page - 1) * limit;

        const filter = {
            user: req.user.userId,
            deletedAt: null
        };

        if (req.query.priority !== undefined) {

            const priority = req.query.priority.trim().toLowerCase();

            filter.priority = priority;
        }

        if (req.query.completed !== undefined) {

            filter.completed = req.query.completed === "true";

        }



        // -------------------------
// Date filters
// -------------------------

if (
    req.query.overdue === "true" ||
    req.query.dueBefore !== undefined ||
    req.query.dueAfter !== undefined
) {
    filter.dueDate = {};

    if (req.query.overdue === "true") {
        filter.dueDate.$lt = new Date();

        if (req.query.completed === undefined) {
            filter.completed = false;
        }
    }

    if (req.query.dueBefore !== undefined) {
        const dueBefore = new Date(req.query.dueBefore);

        if (
            filter.dueDate.$lt === undefined ||
            dueBefore < filter.dueDate.$lt
        ) {
            filter.dueDate.$lt = dueBefore;
        }
    }

    if (req.query.dueAfter !== undefined) {
        filter.dueDate.$gt = new Date(
            `${req.query.dueAfter}T23:59:59.999Z`
        );
    }
}


    const search = req.query.search;

    if (search !== undefined) {

        const escapedSearch = search.trim().replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        filter.$or = [
            {
                title: {
                    $regex: escapedSearch,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: escapedSearch,
                    $options: "i"
                }
            }
        ];
    }   
    
    
        if (
            req.query.tag !== undefined &&
            req.query.tags !== undefined
        ) {
            throw new ApiError(
                400,
                "Use either tag or tags, not both"
            );
        }

        if (req.query.tag !== undefined) {
            filter.tags = req.query.tag.trim().toLowerCase();
        }

        if (req.query.tags !== undefined) {

            const tagList = req.query.tags
                .split(",")
                .map((tag) => tag.trim().toLowerCase());

            filter.tags = {
                $in: tagList
            };
        }

        if (req.query.category !== undefined) {
            filter.category = req.query.category.trim().toLowerCase();
        }

        const {

            tasks,
            totalTasks

        } = await getTasksService({
            filter,
            sortOrder,
            skip,
            limit
        });

        const totalPages = Math.ceil(totalTasks / limit);

        const hasNextPage = page < totalPages;

        const hasPreviousPage = page > 1;

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    page,
                    limit,
                    totalTasks,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage,
                    tasks
                },
                "Tasks fetched successfully"
            )       
        );
});


const getTaskById = asyncHandler(async (req, res) => {

    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await getTaskByIdService({
        taskId,
        userId: req.user.userId
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

   res.status(200).json(
        new ApiResponse(
            200,
            task,
            "Task fetched successfully"
        )
    );

});

const updateTask = asyncHandler(async (req, res) => {

    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        
        throw new ApiError(
            400,
            "At least one field is required for update"
        );
    }

    const allowedFields = ["title", "description",
         "completed", "priority", "dueDate",
          "tags", "category", "reminder", "recurring"];

    const updateFields = Object.keys(updates);

    const hasInvalidField = updateFields.some(

        (field) => !allowedFields.includes(field)
    );

    if(hasInvalidField){

        throw new ApiError(400, "Invalid update field");
    }


    if (updates.priority !== undefined) {
        updates.priority = updates.priority.trim().toLowerCase();
    }

    if (
        updates.category !== undefined &&
        updates.category !== null
    ) {
        updates.category = updates.category.trim().toLowerCase();
    }

    if (updates.tags !== undefined) {
        updates.tags = [
            ...new Set(
                updates.tags.map((tag) => tag.trim().toLowerCase())
            )
        ];
    }

    if (updates.reminder !== undefined) {

        if (updates.reminder.enabled !== undefined) {
            updates["reminder.enabled"] = updates.reminder.enabled;
        }

        if (updates.reminder.remindAt !== undefined) {
            updates["reminder.remindAt"] = updates.reminder.remindAt;
        }

        delete updates.reminder;
    }

    if (updates.recurring !== undefined) {
        if (updates.recurring.enabled !== undefined) {
            updates["recurring.enabled"] = updates.recurring.enabled;
        }

        if (updates.recurring.frequency !== undefined) {
            updates["recurring.frequency"] =
                updates.recurring.frequency.trim().toLowerCase();
        }

        delete updates.recurring;
    }

    const updatedTask = await updateTaskService({
        taskId,
        userId: req.user.userId,
        updates
    });

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            updatedTask,
            "Task updated successfully"
        )
    );

});


const deleteTask = asyncHandler(async (req, res) => {

    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const deletedTask = await deleteTaskService({
        taskId,
        userId: req.user.userId
    });

    if (!deletedTask) {
        throw new ApiError(404, "Task not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Task deleted successfully"
        )
    );
});

const restoreTask = asyncHandler(async (req, res) => {

    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const restoredTask = await restoreTaskService({
        taskId,
        userId: req.user.userId
    });

    if (!restoredTask) {
        throw new ApiError(404, "Deleted task not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            restoredTask,
            "Task restored successfully"
        )
    );
});

const bulkUpdateTasks = asyncHandler(async (req, res) => {

    const { taskIds, updates } = req.body;

    const updatedTasks = await bulkUpdateTasksService({
        taskIds,
        userId: req.user.userId,
        updates
    });

    if (!updatedTasks) {
        throw new ApiError(
            404,
            "One or more tasks not found"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            updatedTasks,
            "Tasks updated successfully"
        )
    );
});

const bulkDeleteTasks = asyncHandler(async (req, res) => {

    const { taskIds } = req.body;

    const deletedTasks = await bulkDeleteTasksService({
        taskIds,
        userId: req.user.userId
    });

    if (!deletedTasks) {
        throw new ApiError(
            404,
            "One or more tasks not found"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            deletedTasks,
            "Tasks deleted successfully"
        )
    );
});

const getTaskStats = asyncHandler(async (req, res) => {
    
    const stats = await getTaskStatsService({
        userId: req.user.userId
    });


    const completedTasks =
        stats.find((item) => item._id === true)?.count || 0;

    const pendingTasks =
        stats.find((item) => item._id === false)?.count || 0;

    const totalTasks = completedTasks + pendingTasks;

    res.status(200).json(
        new ApiResponse(
            200,
            {
                totalTasks,
                completedTasks,
                pendingTasks
            },
            "Task statistics fetched successfully"
        )
    );
});



module.exports = {

    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    bulkDeleteTasks,
    restoreTask,
    bulkUpdateTasks,
    getTaskStats

};