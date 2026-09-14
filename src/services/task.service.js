const Task = require("../models/task.model");
const mongoose = require("mongoose");
const ApiError = require("../utils/api-error");

const addRecurringInterval = (date, frequency) => {

    const nextDate = new Date(date);

    if (frequency === "daily") {
        nextDate.setDate(nextDate.getDate() + 1);
    }

    if (frequency === "weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
    }

    if (frequency === "monthly") {

        const originalDay = nextDate.getDate();

        nextDate.setDate(1);
        nextDate.setMonth(nextDate.getMonth() + 1);

        const lastDayOfMonth = new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() + 1,
            0
        ).getDate();

        nextDate.setDate(
            Math.min(originalDay, lastDayOfMonth)
        );
    }

    return nextDate;
};


const createTaskService = async ({
    title,
    description,
    completed,
    priority,
    dueDate,
    tags,
    category,
    reminder,
    recurring: normalizedRecurring,
    userId
}) => {

    const newTask = await Task.create({
        title,
        description,
        completed,
        priority,
        dueDate,
        tags,
        category,
        reminder,
        recurring: normalizedRecurring,
        user: userId
    });

    return newTask;
};

const getTasksService = async ({
    filter,
    sortOrder,
    skip,
    limit
}) => {

    const tasks = await Task.find(filter)
        .sort({
            createdAt: sortOrder,
            _id: sortOrder
        })
        .skip(skip)
        .limit(limit);

    const totalTasks = await Task.countDocuments(filter);

    return {
        tasks,
        totalTasks
    };
};

const getTaskByIdService = async ({
    taskId,
    userId
}) => {

    const task = await Task.findOne({
        _id: taskId,
        user: userId,
        deletedAt: null
    });

    return task;
};

const updateTaskService = async ({
    taskId,
    userId,
    updates
}) => {

    const existingTask = await Task.findOne({
        _id: taskId,
        user: userId
    });

    if (!existingTask) {
        return null;
    }

    const recurringEnabled =
        updates["recurring.enabled"] !== undefined
            ? updates["recurring.enabled"]
            : existingTask.recurring.enabled;

    const recurringFrequency =
        updates["recurring.frequency"] !== undefined
            ? updates["recurring.frequency"]
            : existingTask.recurring.frequency;

    const dueDate =
        updates.dueDate !== undefined
            ? updates.dueDate
            : existingTask.dueDate;

    if (recurringEnabled === true && dueDate === null) {
        throw new ApiError(
            400,
            "Due date is required when recurring is enabled"
        );
    }

    if (
        updates.completed === true &&
        recurringEnabled === true
    ) {
        updates.dueDate = addRecurringInterval(
            dueDate,
            recurringFrequency
        );

        updates.completed = false;
    }

    const updatedTask = await Task.findOneAndUpdate(
        {
            _id: taskId,
            user: userId
        },
        updates,
        {
            new: true,
            runValidators: true
        }
    );

    return updatedTask;
};
const deleteTaskService = async ({
    taskId,
    userId
}) => {

    const deletedTask = await Task.findOneAndUpdate(
        {
            _id: taskId,
            user: userId,
            deletedAt: null
        },
        {
            deletedAt: new Date()
        },
        {
            new: true
        }
    );

    return deletedTask;
};

const bulkDeleteTasksService = async ({
    taskIds,
    userId
}) => {

    const matchingTasks = await Task.find({
        _id: { $in: taskIds },
        user: userId,
        deletedAt: null
    }).select("_id");

    if (matchingTasks.length !== taskIds.length) {
        return null;
    }

    const deletedTasks = await Task.updateMany(
        {
            _id: { $in: taskIds },
            user: userId,
            deletedAt: null
        },
        {
            $set: {
                deletedAt: new Date()
            }
        }
    );

    return deletedTasks;
};

const restoreTaskService = async ({
    taskId,
    userId
}) => {

    const restoredTask = await Task.findOneAndUpdate(
        {
            _id: taskId,
            user: userId,
            deletedAt: {
                $ne: null
            }
        },
        {
            deletedAt: null
        },
        {
            new: true
        }
    );

    return restoredTask;
};

const bulkUpdateTasksService = async ({
    taskIds,
    userId,
    updates
}) => {

    const matchingTasks = await Task.find({
        _id: { $in: taskIds },
        user: userId,
        deletedAt: null
    }).select("_id");

    if (matchingTasks.length !== taskIds.length) {
        return null;
    }

    const updatedTasks = await Task.updateMany(
        {
            _id: { $in: taskIds },
            user: userId,
            deletedAt: null
        },
        {
            $set: updates
        },
        {
            runValidators: true
        }
    );

    return updatedTasks;
};

const getTaskStatsService = async ({
    userId
}) => {

    const stats = await Task.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: "$completed",
                count: { $sum: 1 }
            }
        }
    ]);

    return stats;
};

module.exports = {
    createTaskService,
    getTasksService,
    getTaskByIdService,
    updateTaskService,
    deleteTaskService,
    bulkDeleteTasksService,
    restoreTaskService,
    bulkUpdateTasksService,
    getTaskStatsService
};