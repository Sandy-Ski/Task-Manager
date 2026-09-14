/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete backend project
 *               description:
 *                 type: string
 *                 example: Finish the Task Manager API documentation
 *               completed:
 *                 type: boolean
 *                 example: false
 *               priority:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *                 example: high
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - backend
 *                   - nodejs
 *               category:
 *                 type: string
 *                 example: development
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-31T18:00:00.000Z
 *               reminder:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   remindAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-12-31T17:00:00.000Z
 *               recurring:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   frequency:
 *                     type: string
 *                     enum:
 *                       - daily
 *                       - weekly
 *                       - monthly
 *                     example: weekly
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required or invalid token
 */




/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get tasks for the authenticated user
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of tasks per page
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - oldest
 *             - newest
 *         description: Sort tasks by creation date
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title or description
 *
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter tasks by completion status
 *
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum:
 *             - low
 *             - medium
 *             - high
 *         description: Filter tasks by priority
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter tasks by category
 *
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter tasks by tag
 *
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Authentication required or invalid token
 */


/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics for the authenticated user
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics retrieved successfully
 *       401:
 *         description: Authentication required or invalid token
 */


/**
 * @swagger
 * /tasks/bulk:
 *   patch:
 *     summary: Update multiple tasks at once
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *               - updates
 *             properties:
 *               taskIds:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: string
 *                 example:
 *                   - 64f1a2b3c4d5e6f789012345
 *                   - 64f1a2b3c4d5e6f789012346
 *               updates:
 *                 type: object
 *                 properties:
 *                   completed:
 *                     type: boolean
 *                     example: true
 *                   priority:
 *                     type: string
 *                     enum:
 *                       - low
 *                       - medium
 *                       - high
 *                     example: high
 *                   category:
 *                     type: string
 *                     example: work
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-12-31T18:00:00.000Z
 *     responses:
 *       200:
 *         description: Tasks updated successfully
 *       400:
 *         description: Invalid task IDs or update data
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: One or more tasks not found
 */


/**
 * @swagger
 * /tasks/bulk:
 *   delete:
 *     summary: Delete multiple tasks at once
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *             properties:
 *               taskIds:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: string
 *                 example:
 *                   - 64f1a2b3c4d5e6f789012345
 *                   - 64f1a2b3c4d5e6f789012346
 *     responses:
 *       200:
 *         description: Tasks deleted successfully
 *       400:
 *         description: Invalid task IDs
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: One or more tasks not found
 */


/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to retrieve
 *         example: 64f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       400:
 *         description: Invalid task ID
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: Task not found
 */



/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update a specific task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to update
 *         example: 64f1a2b3c4d5e6f789012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated task title
 *               description:
 *                 type: string
 *                 example: Updated task description
 *               completed:
 *                 type: boolean
 *                 example: true
 *               priority:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *                 example: high
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - backend
 *                   - nodejs
 *               category:
 *                 type: string
 *                 example: development
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-31T18:00:00.000Z
 *               reminder:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   remindAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-12-31T17:00:00.000Z
 *               recurring:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   frequency:
 *                     type: string
 *                     enum:
 *                       - daily
 *                       - weekly
 *                       - monthly
 *                     example: weekly
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid task ID or update data
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: Task not found
 */



/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Soft delete a specific task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to delete
 *         example: 64f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Invalid task ID
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: Task not found
 */


/**
 * @swagger
 * /tasks/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to restore
 *         example: 64f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Task restored successfully
 *       400:
 *         description: Invalid task ID
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: Task not found
 */