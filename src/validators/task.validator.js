const mongoose = require("mongoose");



const createTaskValidation = (req) => {

    const {
        title,
        description,
        completed,
        priority,
        dueDate,
        tags,
        category,
        reminder,
        recurring
    } = req.body || {};

    if (
        typeof title !== "string" ||
        !title.trim()
    ) {
        return {
            statusCode: 400,
            message: "Task title is required and must be a string"
        };
    }

    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        return {
            statusCode: 400,
            message: "Description must be a string"
        };
    }

    if (
        completed !== undefined &&
        typeof completed !== "boolean"
    ) {
        return {
            statusCode: 400,
            message: "Completed must be a boolean"
        };
    }


    if (
        priority !== undefined &&
        typeof priority !== "string"
    ) {
        return {
            statusCode: 400,
            message: "Priority must be a string"
        };
    }

    if (
        priority !== undefined &&
        !["low", "medium", "high"].includes(
            priority.trim().toLowerCase()
        )
    )
    {
        return {
            statusCode: 400,
            message: "Priority must be low, medium, or high"
        };
    }
    if (
        dueDate !== undefined &&
        (
            typeof dueDate !== "string" ||
            isNaN(Date.parse(dueDate))
        )
    ) {
        return {
            statusCode: 400,
            message: "Due date must be a valid date"
        };
    }

    if (
        tags !== undefined &&
        (
            !Array.isArray(tags) ||
            tags.length > 10 ||
            tags.some(
                (tag) =>
                    typeof tag !== "string" ||
                    !tag.trim() ||
                    tag.trim().length > 30
            )
        )
    ) {
        return {
            statusCode: 400,
            message: "Tags must be an array of up to 10 non-empty strings, each 30 characters or less"
        };
    }

    if (
        category !== undefined &&
        (
            typeof category !== "string" ||
            !category.trim()
        )
    ) {
        return {
            statusCode: 400,
            message: "Category must be a non-empty string"
        };
    }

    if (
        category !== undefined &&
        category.trim().length > 30
    ) {
        return {
            statusCode: 400,
            message: "Category must not exceed 30 characters"
        };
    }

if (reminder !== undefined) {

    if (
        typeof reminder !== "object" ||
        reminder === null ||
        Array.isArray(reminder)
    ) {
        return {
            statusCode: 400,
            message: "Reminder must be an object"
        };
    }

    if (
        reminder.enabled !== undefined &&
        typeof reminder.enabled !== "boolean"
    ) {
        return {
            statusCode: 400,
            message: "Reminder enabled must be a boolean"
        };
    }

    if (
        reminder.remindAt !== undefined &&
        (
            typeof reminder.remindAt !== "string" ||
            Number.isNaN(Date.parse(reminder.remindAt))
        )
    ) {
        return {
            statusCode: 400,
            message: "Reminder remindAt must be a valid date"
        };
    }

    if (
        reminder.enabled === true &&
        reminder.remindAt === undefined
    ) {
        return {
            statusCode: 400,
            message: "Reminder time is required when reminder is enabled"
        };
    }

    if (
        reminder.enabled === true &&
        reminder.remindAt !== undefined &&
        new Date(reminder.remindAt) <= new Date()
    ) {
        return {
            statusCode: 400,
            message: "Reminder time must be in the future"
        };
    }
}


    if (recurring !== undefined) {

    if (
        typeof recurring !== "object" ||
        recurring === null ||
        Array.isArray(recurring)
    ) {
        return {
            statusCode: 400,
            message: "Recurring must be an object"
        };
    }

    if (
        recurring.enabled !== undefined &&
        typeof recurring.enabled !== "boolean"
    ) {
        return {
            statusCode: 400,
            message: "Recurring enabled must be a boolean"
        };
    }

    if (
        recurring.frequency !== undefined &&
        (
            typeof recurring.frequency !== "string" ||
            !["daily", "weekly", "monthly"].includes(
                recurring.frequency.trim().toLowerCase()
            )
        )
    ) {
        return {
            statusCode: 400,
            message: "Recurring frequency must be daily, weekly, or monthly"
        };
    }

    if (
        recurring.enabled === true &&
        dueDate === undefined
    ) {
        return {
            statusCode: 400,
            message: "Due date is required when recurring is enabled"
        };
    }
}



    return null;
};

const updateTaskValidation = (req) => {

    const {
        title,
        description,
        completed,
        priority,
        dueDate,
        tags,
        category,
        reminder,
        recurring
    } = req.body || {};

    if (
        title !== undefined &&
        (typeof title !== "string" || !title.trim())
    ) {
        return {
            statusCode: 400,
            message: "Title must be a non-empty string"
        };
    }

    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        return {
            statusCode: 400,
            message: "Description must be a string"
        };
    }

    if (
        completed !== undefined &&
        typeof completed !== "boolean"
    ) {
        return {
            statusCode: 400,
            message: "Completed must be a boolean"
        };
    }

    if (
        priority !== undefined &&
        typeof priority !== "string"
    ) {
        return {
            statusCode: 400,
            message: "Priority must be a string"
        };
    }

    if (
        priority !== undefined &&
        !["low", "medium", "high"].includes(
            priority.trim().toLowerCase()
        )
    ) {
        return {
            statusCode: 400,
            message: "Priority must be low, medium, or high"
        };
    }

    if (
        dueDate !== undefined &&
        dueDate !== null &&
        (
            typeof dueDate !== "string" ||
            isNaN(Date.parse(dueDate))
        )
    ) {
        return {
            statusCode: 400,
            message: "Due date must be a valid date or null"
        };
    }

    if (
        tags !== undefined &&
        (
            !Array.isArray(tags) ||
            tags.length > 10 ||
            tags.some(
                (tag) =>
                    typeof tag !== "string" ||
                    !tag.trim() ||
                    tag.trim().length > 30
            )
        )
    ) {
        return {
            statusCode: 400,
            message: "Tags must be an array of up to 10 non-empty strings, each 30 characters or less"
        };
    }

    if (
        category !== undefined &&
        category !== null &&
        (
            typeof category !== "string" ||
            !category.trim()
        )
    ) {
        return {
            statusCode: 400,
            message: "Category must be a non-empty string"
        };
    }

    if (
        category !== undefined &&
        category !== null &&
        category.trim().length > 30
    ) {
        return {
            statusCode: 400,
            message: "Category must not exceed 30 characters"
        };
    }

    if (reminder !== undefined) {

    if (
        typeof reminder !== "object" ||
        reminder === null ||
        Array.isArray(reminder)
    ) {
        return {
            statusCode: 400,
            message: "Reminder must be an object"
        };
    }

    if (
        reminder.enabled !== undefined &&
        typeof reminder.enabled !== "boolean"
    ) {
        return {
            statusCode: 400,
            message: "Reminder enabled must be a boolean"
        };
    }

    if (
        reminder.remindAt !== undefined &&
        reminder.remindAt !== null &&
        (
            typeof reminder.remindAt !== "string" ||
            Number.isNaN(Date.parse(reminder.remindAt))
        )
    ) {
        return {
            statusCode: 400,
            message: "Reminder remindAt must be a valid date or null"
        };
    }

    if (
        reminder.enabled === true &&
        (
            reminder.remindAt === undefined ||
            reminder.remindAt === null
        )
    ) {
        return {
            statusCode: 400,
            message: "Reminder time is required when reminder is enabled"
        };
    }

    if (
        reminder.enabled === true &&
        reminder.remindAt !== undefined &&
        reminder.remindAt !== null &&
        new Date(reminder.remindAt) <= new Date()
    ) {
        return {
            statusCode: 400,
            message: "Reminder time must be in the future"
        };
    }
}
    if (recurring !== undefined) {

    if (
        typeof recurring !== "object" ||
        recurring === null ||
        Array.isArray(recurring)
    ) {
        return {
            statusCode: 400,
            message: "Recurring must be an object"
        };
    }

    if (
        recurring.enabled !== undefined &&
        typeof recurring.enabled !== "boolean"
    ) {
        return {
            statusCode: 400,
            message: "Recurring enabled must be a boolean"
        };
    }

    if (
        recurring.frequency !== undefined &&
        (
            typeof recurring.frequency !== "string" ||
            !["daily", "weekly", "monthly"].includes(
                recurring.frequency.trim().toLowerCase()
            )
        )
    ) {
        return {
            statusCode: 400,
            message: "Recurring frequency must be daily, weekly, or monthly"
        };
    }

}



    return null;
};

const bulkUpdateTasksValidation = (req) => {

    const { taskIds, updates } = req.body;

    if (!Array.isArray(taskIds)) {
        return {
            statusCode: 400,
            message: "taskIds must be an array"
        };
    }

    if (taskIds.length === 0) {
        return {
            statusCode: 400,
            message: "At least one task ID is required"
        };
    }

    if (taskIds.length > 50) {
        return {
            statusCode: 400,
            message: "Maximum 50 tasks can be updated at once"
        };
    }

    const hasInvalidTaskId = taskIds.some(
        (taskId) =>
            typeof taskId !== "string" ||
            !mongoose.Types.ObjectId.isValid(taskId)
    );

    if (hasInvalidTaskId) {
        return {
            statusCode: 400,
            message: "All task IDs must be valid"
        };
    }

    const uniqueTaskIds = new Set(taskIds);

    if (uniqueTaskIds.size !== taskIds.length) {
        return {
            statusCode: 400,
            message: "Duplicate task IDs are not allowed"
        };
    }

    if (
        typeof updates !== "object" ||
        updates === null ||
        Array.isArray(updates)
    ) {
        return {
            statusCode: 400,
            message: "updates must be an object"
        };
    }

    if (Object.keys(updates).length === 0) {
        return {
            statusCode: 400,
            message: "At least one update field is required"
        };
    }

    const allowedFields = [
        "title",
        "description",
        "completed",
        "priority",
        "dueDate",
        "tags",
        "category",
        "reminder",
        "recurring"
    ];

    const updateFields = Object.keys(updates);

    const hasInvalidField = updateFields.some(
        (field) => !allowedFields.includes(field)
    );

    if (hasInvalidField) {
        return {
            statusCode: 400,
            message: "Invalid bulk update field"
        };
    }

    return null;
};

const bulkDeleteTasksValidation = (req) => {

    const { taskIds } = req.body;

    if (!Array.isArray(taskIds)) {
        return {
            statusCode: 400,
            message: "taskIds must be an array"
        };
    }

    if (taskIds.length === 0) {
        return {
            statusCode: 400,
            message: "At least one task ID is required"
        };
    }

    if (taskIds.length > 50) {
        return {
            statusCode: 400,
            message: "Maximum 50 tasks can be deleted at once"
        };
    }

    const hasInvalidTaskId = taskIds.some(
        (taskId) =>
            typeof taskId !== "string" ||
            !mongoose.Types.ObjectId.isValid(taskId)
    );

    if (hasInvalidTaskId) {
        return {
            statusCode: 400,
            message: "All task IDs must be valid"
        };
    }

    const uniqueTaskIds = new Set(taskIds);

    if (uniqueTaskIds.size !== taskIds.length) {
        return {
            statusCode: 400,
            message: "Duplicate task IDs are not allowed"
        };
    }

    return null;
};

const getTasksValidation = (req) => {

    const {
        page,
        limit,
        sort,
        priority,
        completed,
        overdue,
        dueBefore,
        dueAfter,
        search,
        tag,
        tags,
        category
    } = req.query;


    // -------------------------
    // Pagination
    // -------------------------

    if (
        page !== undefined &&
        (
            !Number.isInteger(Number(page)) ||
            Number(page) < 1
        )
    ) {
        return {
            statusCode: 400,
            message: "Page must be a positive integer"
        };
    }


    if (
        limit !== undefined &&
        (
            !Number.isInteger(Number(limit)) ||
            Number(limit) < 1 ||
            Number(limit) > 100
        )
    ) {
        return {
            statusCode: 400,
            message: "Limit must be an integer between 1 and 100"
        };
    }


    // -------------------------
    // Sorting
    // -------------------------

    if (
        sort !== undefined &&
        (
            typeof sort !== "string" ||
            !["oldest", "newest"].includes(
                sort.trim().toLowerCase()
            )
        )
    ) {
        return {
            statusCode: 400,
            message: "Sort must be oldest or newest"
        };
    }


    // -------------------------
    // Priority filter
    // -------------------------

    if (
        priority !== undefined &&
        (
            typeof priority !== "string" ||
            !priority.trim() ||
            !["low", "medium", "high"].includes(
                priority.trim().toLowerCase()
            )
        )
    ) {
        return {
            statusCode: 400,
            message: "Priority must be low, medium, or high"
        };
    }


    // -------------------------
    // Completed filter
    // -------------------------

    if (
        completed !== undefined &&
        completed !== "true" &&
        completed !== "false"
    ) {
        return {
            statusCode: 400,
            message: "Completed must be true or false"
        };
    }


    // -------------------------
    // Overdue filter
    // -------------------------

    if (
        overdue !== undefined &&
        overdue !== "true" &&
        overdue !== "false"
    ) {
        return {
            statusCode: 400,
            message: "Overdue must be true or false"
        };
    }

    if (
        completed === "true" &&
        overdue === "true"
    ) {
        return {
            statusCode: 400,
            message: "Completed and overdue filters cannot both be true"
        };
    }


    // -------------------------
    // Due before filter
    // -------------------------

    if (
        dueBefore !== undefined &&
        (
            typeof dueBefore !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(
                dueBefore.trim()
            ) ||
            isNaN(Date.parse(dueBefore))
        )
    ) {
        return {
            statusCode: 400,
            message: "dueBefore must be a valid date in YYYY-MM-DD format"
        };
    }


    // -------------------------
    // Due after filter
    // -------------------------

    if (
        dueAfter !== undefined &&
        (
            typeof dueAfter !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(
                dueAfter.trim()
            ) ||
            isNaN(Date.parse(dueAfter))
        )
    ) {
        return {
            statusCode: 400,
            message: "dueAfter must be a valid date in YYYY-MM-DD format"
        };
    }

    if (
        dueBefore !== undefined &&
        dueAfter !== undefined &&
        new Date(dueBefore) <= new Date(dueAfter)
    ) {
        return {
            statusCode: 400,
            message: "dueBefore must be later than dueAfter"
        };
    }


    // -------------------------
    // Search filter
    // -------------------------

    if (
        search !== undefined &&
        (
            typeof search !== "string" ||
            !search.trim()
        )
    ) {
        return {
            statusCode: 400,
            message: "Search must be a non-empty string"
        };
    }


    if (
        search !== undefined &&
        search.trim().length > 100
    ) {
        return {
            statusCode: 400,
            message: "Search must not exceed 100 characters"
        };
    }


    // -------------------------
    // Tag filter
    // -------------------------

    if (
        tag !== undefined &&
        (
            typeof tag !== "string" ||
            !tag.trim()
        )
    ) {
        return {
            statusCode: 400,
            message: "Tag must be a non-empty string"
        };
    }


    if (
        tag !== undefined &&
        tag.trim().length > 30
    ) {
        return {
            statusCode: 400,
            message: "Tag must not exceed 30 characters"
        };
    }


    // -------------------------
// Multiple tags filter
// -------------------------

if (
    tags !== undefined &&
    (
        typeof tags !== "string" ||
        !tags.trim()
    )
) {
    return {
        statusCode: 400,
        message: "Tags must be a non-empty comma-separated string"
    };
}

if (tags !== undefined) {

    const tagList = tags
        .split(",")
        .map((tag) => tag.trim());

    if (
        tagList.length > 10 ||
        tagList.some(
            (tag) =>
                !tag ||
                tag.length > 30
        )
    ) {
        return {
            statusCode: 400,
            message: "Tags must contain up to 10 non-empty values, each 30 characters or less"
        };
    }
}

// -------------------------
// Tag and multiple tags conflict
// -------------------------

if (
    tag !== undefined &&
    tags !== undefined
) {
    return {
        statusCode: 400,
        message: "Use either tag or tags, not both"
    };
}


    // -------------------------
    // Category filter
    // -------------------------

    if (
        category !== undefined &&
        (
            typeof category !== "string" ||
            !category.trim()
        )
    ) {
        return {
            statusCode: 400,
            message: "Category must be a non-empty string"
        };
    }


    if (
        category !== undefined &&
        category.trim().length > 30
    ) {
        return {
            statusCode: 400,
            message: "Category must not exceed 30 characters"
        };
    }


    return null;
};

module.exports = {
    createTaskValidation,
    updateTaskValidation,
    getTasksValidation,
    bulkUpdateTasksValidation,
    bulkDeleteTasksValidation
};