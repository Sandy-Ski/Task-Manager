/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: TestPassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User with this email already exists
 */


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: TestPassword123
 *               sessionName:
 *                 type: string
 *                 example: Chrome on Windows
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid login request
 *       401:
 *         description: Invalid email or password
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the current authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: User not found
 */


/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: Refresh an access token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Invalid refresh token request
 *       401:
 *         description: Invalid or expired refresh token
 */


/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid logout request
 *       401:
 *         description: Invalid or expired refresh token
 */



/**
 * @swagger
 * /users/password:
 *   patch:
 *     summary: Change the authenticated user's password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password change request
 *       401:
 *         description: Authentication required or current password is incorrect
 *       404:
 *         description: User not found
 */


/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Password reset request processed
 *       400:
 *         description: Invalid email
 */


/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset a user's password using a reset token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 example: your-reset-token
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword456
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token, or invalid password
 *       404:
 *         description: Password reset token not found
 */


/**
 * @swagger
 * /users/sessions:
 *   get:
 *     summary: Get all active sessions for the authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/sessions:
 *   delete:
 *     summary: Revoke all active sessions for the authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked successfully
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: User not found
 */


/**
 * @swagger
 * /users/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session to revoke
 *         example: 64f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *       400:
 *         description: Invalid session ID
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: Session not found
 */