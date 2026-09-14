const request = require("supertest");

const app = require("../src/app");


test("GET / should return the API welcome message", async () => {

    const response = await request(app)
        .get("/");

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "Task Manager API is running"
    );
});


test("GET /about should return the about message", async () => {

    const response = await request(app)
        .get("/about");

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "This is the Task Manager API"
    );
});


test("POST /users/register should create a new user", async () => {

    const response = await request(app)
        .post("/users/register")
        .send({
            name: "Test User",
            email: `test${Date.now()}@example.com`,
            password: "TestPassword123"
        });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "User registered successfully"
    );

    expect(response.body.data).toBeDefined();

    expect(response.body.data.name).toBe("Test User");

    expect(response.body.data.email).toContain(
        "@example.com"
    );
});

test("POST /users/register should reject duplicate email", async () => {

    const email = `duplicate${Date.now()}@example.com`;

    // First registration
    await request(app)
        .post("/users/register")
        .send({
            name: "First User",
            email,
            password: "TestPassword123"
        });

    // Second registration with the same email
    const response = await request(app)
        .post("/users/register")
        .send({
            name: "Second User",
            email,
            password: "TestPassword123"
        });

    expect(response.statusCode).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Email is already registered"
    );

    expect(response.body.data).toBeNull();
});

test("POST /users/register should reject missing password", async () => {

    const response = await request(app)
        .post("/users/register")
        .send({
            name: "Test User",
            email: `missingpassword${Date.now()}@example.com`
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Password is required and must be a string"
    );

    expect(response.body.data).toBeNull();
});

test("POST /users/register should reject invalid email", async () => {

    const response = await request(app)
        .post("/users/register")
        .send({
            name: "Test User",
            email: "not-an-email",
            password: "TestPassword123"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Invalid email format"
    );

    expect(response.body.data).toBeNull();
});

test("POST /users/login should login a registered user", async () => {

    const email = `login${Date.now()}@example.com`;

    // First create the user
    await request(app)
        .post("/users/register")
        .send({
            name: "Login Test User",
            email,
            password: "TestPassword123"
        });

    // Then login with the same credentials
    const response = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "Login successful"
    );

    expect(response.body.data).toBeDefined();

    expect(response.body.data.token).toBeDefined();

    expect(response.body.data.refreshToken).toBeDefined();

    expect(response.body.data.user).toBeDefined();

    expect(response.body.data.user.name).toBe(
        "Login Test User"
    );

    expect(response.body.data.user.email).toBe(
        email
    );
});

test("POST /users/login should reject incorrect password", async () => {

    const email = `wrongpassword${Date.now()}@example.com`;

    // Create the user
    await request(app)
        .post("/users/register")
        .send({
            name: "Wrong Password User",
            email,
            password: "CorrectPassword123"
        });

    // Try to login with the wrong password
    const response = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "WrongPassword123"
        });

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Invalid email or password"
    );

    expect(response.body.data).toBeNull();
});

test("POST /users/login should reject unregistered email", async () => {

    const response = await request(app)
        .post("/users/login")
        .send({
            email: `notregistered${Date.now()}@example.com`,
            password: "TestPassword123"
        });

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Invalid email or password"
    );

    expect(response.body.data).toBeNull();
});

test("GET /users/me should reject request without authentication", async () => {

    const response = await request(app)
        .get("/users/me");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Authentication required"
    );

    expect(response.body.data).toBeNull();
});

test("GET /users/me should return current user with valid token", async () => {

    const email = `me${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Current User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Access protected route
    const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User fetched successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe("Current User");
    expect(response.body.data.email).toBe(email);
});

test("GET /users/me should reject invalid token", async () => {

    const response = await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or expired token");
    expect(response.body.data).toBeNull();
});

test("GET /users/me should reject malformed token", async () => {

    const response = await request(app)
        .get("/users/me")
        .set(
            "Authorization",
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token"
        );

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or expired token");
    expect(response.body.data).toBeNull();
});

test("GET /users/me should reject token without Bearer prefix", async () => {

    const response = await request(app)
        .get("/users/me")
        .set("Authorization", "invalid-token");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid authorization header");
    expect(response.body.data).toBeNull();
});

test("GET /users/me should reject empty Bearer token", async () => {

    const response = await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid authorization header");
    expect(response.body.data).toBeNull();
});

test("GET /users/me should reject incorrect authorization scheme", async () => {

    const response = await request(app)
        .get("/users/me")
        .set("Authorization", "Token some-token");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid authorization header");
    expect(response.body.data).toBeNull();
});

test("GET /users/me should reject expired token", async () => {

    const jwt = require("jsonwebtoken");

    const expiredToken = jwt.sign(
        {
            userId: "6aa69253f714a079499bcc00",
            tokenVersion: 0
        },
        process.env.JWT_SECRET,
        {
            expiresIn: -1
        }
    );

    const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or expired token");
    expect(response.body.data).toBeNull();
});

test("POST /tasks should create a task for authenticated user", async () => {

    const email = `task${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Task Test User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create task
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test Task",
            description: "This is a test task"
        });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Task created successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.title).toBe("Test Task");
    expect(response.body.data.description).toBe("This is a test task");
    expect(response.body.data.completed).toBe(false);
    expect(response.body.data.priority).toBe("medium");
    expect(response.body.data.user).toBeDefined();
});

test("GET /tasks/:id should reject access to another user's task", async () => {

    // Create User A
    const userAEmail = `userA${Date.now()}@example.com`;

    await request(app)
        .post("/users/register")
        .send({
            name: "User A",
            email: userAEmail,
            password: "TestPassword123"
        });

    // Login User A
    const userALogin = await request(app)
        .post("/users/login")
        .send({
            email: userAEmail,
            password: "TestPassword123"
        });

    const userAToken = userALogin.body.data.token;

    // User A creates a task
    const taskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
            title: "User A Private Task",
            description: "This task belongs to User A"
        });

    const taskId = taskResponse.body.data._id;

    // Create User B
    const userBEmail = `userB${Date.now()}@example.com`;

    await request(app)
        .post("/users/register")
        .send({
            name: "User B",
            email: userBEmail,
            password: "TestPassword123"
        });

    // Login User B
    const userBLogin = await request(app)
        .post("/users/login")
        .send({
            email: userBEmail,
            password: "TestPassword123"
        });

    const userBToken = userBLogin.body.data.token;

    // User B tries to access User A's task
    const response = await request(app)
        .get(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${userBToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");
    expect(response.body.data).toBeNull();
});

test("GET /tasks should return authenticated user's tasks in oldest-first order", async () => {

    const email = `gettasks${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Get Tasks User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create first task
    const firstTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "First Task"
        });

    // Create second task
    const secondTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Second Task"
        });

    // Get tasks
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();

    // Verify pagination structure
    expect(response.body.data.page).toBe(1);
    expect(response.body.data.limit).toBeDefined();
    expect(response.body.data.totalTasks).toBe(2);
    expect(response.body.data.totalPages).toBe(1);
    expect(response.body.data.hasNextPage).toBe(false);

    // Verify tasks
    expect(response.body.data.tasks).toHaveLength(2);

    expect(response.body.data.tasks[0]._id)
        .toBe(firstTaskResponse.body.data._id);

    expect(response.body.data.tasks[1]._id)
        .toBe(secondTaskResponse.body.data._id);

    expect(response.body.data.tasks[0].title)
        .toBe("First Task");

    expect(response.body.data.tasks[1].title)
        .toBe("Second Task");
});

test("GET /tasks should handle pagination and limit boundaries correctly", async () => {

    const email = `pagination${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Pagination User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create 3 tasks
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task 1"
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task 2"
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task 3"
        });

    // -------------------------
    // Normal pagination
    // -------------------------

    const page1Response = await request(app)
        .get("/tasks?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

    expect(page1Response.statusCode).toBe(200);
    expect(page1Response.body.success).toBe(true);

    expect(page1Response.body.data.page).toBe(1);
    expect(page1Response.body.data.limit).toBe(2);
    expect(page1Response.body.data.totalTasks).toBe(3);
    expect(page1Response.body.data.totalPages).toBe(2);
    expect(page1Response.body.data.hasNextPage).toBe(true);

    expect(page1Response.body.data.tasks).toHaveLength(2);

    expect(page1Response.body.data.tasks[0].title)
        .toBe("Task 1");

    expect(page1Response.body.data.tasks[1].title)
        .toBe("Task 2");

    // -------------------------
    // Second page
    // -------------------------

    const page2Response = await request(app)
        .get("/tasks?page=2&limit=2")
        .set("Authorization", `Bearer ${token}`);

    expect(page2Response.statusCode).toBe(200);
    expect(page2Response.body.success).toBe(true);

    expect(page2Response.body.data.page).toBe(2);
    expect(page2Response.body.data.limit).toBe(2);
    expect(page2Response.body.data.totalTasks).toBe(3);
    expect(page2Response.body.data.totalPages).toBe(2);
    expect(page2Response.body.data.hasNextPage).toBe(false);

    expect(page2Response.body.data.tasks).toHaveLength(1);

    expect(page2Response.body.data.tasks[0].title)
        .toBe("Task 3");

    // -------------------------
    // Maximum valid limit
    // -------------------------

    const maxLimitResponse = await request(app)
        .get("/tasks?limit=100")
        .set("Authorization", `Bearer ${token}`);

    expect(maxLimitResponse.statusCode).toBe(200);
    expect(maxLimitResponse.body.success).toBe(true);
    expect(maxLimitResponse.body.data.limit).toBe(100);

    // -------------------------
    // Limit above maximum
    // -------------------------

    const invalidLimitResponse = await request(app)
        .get("/tasks?limit=101")
        .set("Authorization", `Bearer ${token}`);

    expect(invalidLimitResponse.statusCode).toBe(400);
    expect(invalidLimitResponse.body.success).toBe(false);
    expect(invalidLimitResponse.body.message)
        .toBe("Limit must be an integer between 1 and 100");
    expect(invalidLimitResponse.body.data).toBeNull();
});

test("GET /tasks should sort tasks correctly", async () => {

    const email = `sorting${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Sorting User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create tasks in a known order
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task 1"
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task 2"
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task 3"
        });

    // -------------------------
    // Oldest first
    // -------------------------

    const oldestResponse = await request(app)
        .get("/tasks?sort=oldest")
        .set("Authorization", `Bearer ${token}`);

    expect(oldestResponse.statusCode).toBe(200);
    expect(oldestResponse.body.success).toBe(true);

    expect(oldestResponse.body.data.tasks).toHaveLength(3);

    expect(oldestResponse.body.data.tasks[0].title)
        .toBe("Task 1");

    expect(oldestResponse.body.data.tasks[1].title)
        .toBe("Task 2");

    expect(oldestResponse.body.data.tasks[2].title)
        .toBe("Task 3");

    // -------------------------
    // Newest first
    // -------------------------

    const newestResponse = await request(app)
        .get("/tasks?sort=newest")
        .set("Authorization", `Bearer ${token}`);

    expect(newestResponse.statusCode).toBe(200);
    expect(newestResponse.body.success).toBe(true);

    expect(newestResponse.body.data.tasks).toHaveLength(3);

    expect(newestResponse.body.data.tasks[0].title)
        .toBe("Task 3");

    expect(newestResponse.body.data.tasks[1].title)
        .toBe("Task 2");

    expect(newestResponse.body.data.tasks[2].title)
        .toBe("Task 1");

    // -------------------------
    // Invalid sort value
    // -------------------------

    const invalidSortResponse = await request(app)
        .get("/tasks?sort=random")
        .set("Authorization", `Bearer ${token}`);

    expect(invalidSortResponse.statusCode).toBe(400);
    expect(invalidSortResponse.body.success).toBe(false);
    expect(invalidSortResponse.body.message)
        .toBe("Sort must be oldest or newest");
    expect(invalidSortResponse.body.data).toBeNull();
});

test("GET /tasks should search tasks correctly and validate search input", async () => {

    const email = `search${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Search User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create tasks
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Learn Node.js",
            description: "Practice backend development"
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Build React App",
            description: "Create a frontend project"
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Read Documentation",
            description: "Learn about Express middleware"
        });

    // -------------------------
    // Search by title
    // -------------------------

    const titleSearchResponse = await request(app)
        .get("/tasks?search=Node")
        .set("Authorization", `Bearer ${token}`);

    expect(titleSearchResponse.statusCode).toBe(200);
    expect(titleSearchResponse.body.success).toBe(true);
    expect(titleSearchResponse.body.data.tasks).toHaveLength(1);
    expect(titleSearchResponse.body.data.tasks[0].title)
        .toBe("Learn Node.js");

    // -------------------------
    // Search by description
    // -------------------------

    const descriptionSearchResponse = await request(app)
        .get("/tasks?search=backend")
        .set("Authorization", `Bearer ${token}`);

    expect(descriptionSearchResponse.statusCode).toBe(200);
    expect(descriptionSearchResponse.body.success).toBe(true);
    expect(descriptionSearchResponse.body.data.tasks).toHaveLength(1);
    expect(descriptionSearchResponse.body.data.tasks[0].title)
        .toBe("Learn Node.js");

    // -------------------------
    // Case-insensitive search
    // -------------------------

    const caseInsensitiveResponse = await request(app)
        .get("/tasks?search=NODE")
        .set("Authorization", `Bearer ${token}`);

    expect(caseInsensitiveResponse.statusCode).toBe(200);
    expect(caseInsensitiveResponse.body.success).toBe(true);
    expect(caseInsensitiveResponse.body.data.tasks).toHaveLength(1);
    expect(caseInsensitiveResponse.body.data.tasks[0].title)
        .toBe("Learn Node.js");

    // -------------------------
    // Search with no matches
    // -------------------------

    const noMatchResponse = await request(app)
        .get("/tasks?search=Python")
        .set("Authorization", `Bearer ${token}`);

    expect(noMatchResponse.statusCode).toBe(200);
    expect(noMatchResponse.body.success).toBe(true);
    expect(noMatchResponse.body.data.tasks).toHaveLength(0);
    expect(noMatchResponse.body.data.totalTasks).toBe(0);

    // -------------------------
    // Empty search
    // -------------------------

    const emptySearchResponse = await request(app)
        .get("/tasks?search=")
        .set("Authorization", `Bearer ${token}`);

    expect(emptySearchResponse.statusCode).toBe(400);
    expect(emptySearchResponse.body.success).toBe(false);
    expect(emptySearchResponse.body.message)
        .toBe("Search must be a non-empty string");
    expect(emptySearchResponse.body.data).toBeNull();

    // -------------------------
    // Search above 100 characters
    // -------------------------

    const longSearch = "a".repeat(101);

    const longSearchResponse = await request(app)
        .get(`/tasks?search=${longSearch}`)
        .set("Authorization", `Bearer ${token}`);

    expect(longSearchResponse.statusCode).toBe(400);
    expect(longSearchResponse.body.success).toBe(false);
    expect(longSearchResponse.body.message)
        .toBe("Search must not exceed 100 characters");
    expect(longSearchResponse.body.data).toBeNull();
});

test("GET /tasks should filter tasks correctly", async () => {

    const email = `filters${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Filter User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create tasks with different filter values

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "High Work Task",
            priority: "high",
            category: "work",
            tags: ["backend", "node"],
            completed: false
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Low Personal Task",
            priority: "low",
            category: "personal",
            tags: ["shopping"],
            completed: true
        });

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Medium Work Task",
            priority: "medium",
            category: "work",
            tags: ["frontend", "react"],
            completed: false
        });

    // -------------------------
    // Priority filter
    // -------------------------

    const priorityResponse = await request(app)
        .get("/tasks?priority=high")
        .set("Authorization", `Bearer ${token}`);

    expect(priorityResponse.statusCode).toBe(200);
    expect(priorityResponse.body.success).toBe(true);
    expect(priorityResponse.body.data.tasks).toHaveLength(1);
    expect(priorityResponse.body.data.tasks[0].title)
        .toBe("High Work Task");

    // -------------------------
    // Completed filter
    // -------------------------

    const completedResponse = await request(app)
        .get("/tasks?completed=true")
        .set("Authorization", `Bearer ${token}`);

    expect(completedResponse.statusCode).toBe(200);
    expect(completedResponse.body.success).toBe(true);
    expect(completedResponse.body.data.tasks).toHaveLength(1);
    expect(completedResponse.body.data.tasks[0].title)
        .toBe("Low Personal Task");

    // -------------------------
    // Category filter
    // -------------------------

    const categoryResponse = await request(app)
        .get("/tasks?category=work")
        .set("Authorization", `Bearer ${token}`);

    expect(categoryResponse.statusCode).toBe(200);
    expect(categoryResponse.body.success).toBe(true);
    expect(categoryResponse.body.data.tasks).toHaveLength(2);

    expect(
        categoryResponse.body.data.tasks.map((task) => task.title)
    ).toEqual([
        "High Work Task",
        "Medium Work Task"
    ]);

    // -------------------------
    // Single tag filter
    // -------------------------

    const tagResponse = await request(app)
        .get("/tasks?tag=backend")
        .set("Authorization", `Bearer ${token}`);

    expect(tagResponse.statusCode).toBe(200);
    expect(tagResponse.body.success).toBe(true);
    expect(tagResponse.body.data.tasks).toHaveLength(1);
    expect(tagResponse.body.data.tasks[0].title)
        .toBe("High Work Task");

    // -------------------------
    // Multiple tags filter
    // -------------------------

    const tagsResponse = await request(app)
        .get("/tasks?tags=backend,node")
        .set("Authorization", `Bearer ${token}`);

    expect(tagsResponse.statusCode).toBe(200);
    expect(tagsResponse.body.success).toBe(true);
    expect(tagsResponse.body.data.tasks).toHaveLength(1);
    expect(tagsResponse.body.data.tasks[0].title)
        .toBe("High Work Task");

    // -------------------------
    // tag + tags conflict
    // -------------------------

    const conflictResponse = await request(app)
        .get("/tasks?tag=backend&tags=backend,node")
        .set("Authorization", `Bearer ${token}`);

    expect(conflictResponse.statusCode).toBe(400);
    expect(conflictResponse.body.success).toBe(false);
    expect(conflictResponse.body.message)
        .toBe("Use either tag or tags, not both");
    expect(conflictResponse.body.data).toBeNull();
});

test("GET /tasks should filter tasks by due dates and validate date filters", async () => {

    const email = `datefilters${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Date Filter User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create task due before the range
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Before Range",
            dueDate: "2026-01-10"
        });

    // Create task inside the range
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Inside Range",
            dueDate: "2026-02-15"
        });

    // Create task after the range
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "After Range",
            dueDate: "2026-03-20"
        });

    // -------------------------
    // dueBefore filter
    // -------------------------

    const dueBeforeResponse = await request(app)
        .get("/tasks?dueBefore=2026-02-01")
        .set("Authorization", `Bearer ${token}`);

    expect(dueBeforeResponse.statusCode).toBe(200);
    expect(dueBeforeResponse.body.success).toBe(true);

    expect(dueBeforeResponse.body.data.tasks).toHaveLength(1);
    expect(dueBeforeResponse.body.data.tasks[0].title)
        .toBe("Before Range");

    // -------------------------
    // dueAfter filter
    // -------------------------

    const dueAfterResponse = await request(app)
        .get("/tasks?dueAfter=2026-03-01")
        .set("Authorization", `Bearer ${token}`);

    expect(dueAfterResponse.statusCode).toBe(200);
    expect(dueAfterResponse.body.success).toBe(true);

    expect(dueAfterResponse.body.data.tasks).toHaveLength(1);
    expect(dueAfterResponse.body.data.tasks[0].title)
        .toBe("After Range");

    // -------------------------
    // Both date filters
    // -------------------------

    const dateRangeResponse = await request(app)
        .get("/tasks?dueAfter=2026-02-01&dueBefore=2026-03-01")
        .set("Authorization", `Bearer ${token}`);

    expect(dateRangeResponse.statusCode).toBe(200);
    expect(dateRangeResponse.body.success).toBe(true);

    expect(dateRangeResponse.body.data.tasks).toHaveLength(1);
    expect(dateRangeResponse.body.data.tasks[0].title)
        .toBe("Inside Range");

    // -------------------------
    // Invalid dueBefore format
    // -------------------------

    const invalidBeforeResponse = await request(app)
        .get("/tasks?dueBefore=2026-02")
        .set("Authorization", `Bearer ${token}`);

    expect(invalidBeforeResponse.statusCode).toBe(400);
    expect(invalidBeforeResponse.body.success).toBe(false);
    expect(invalidBeforeResponse.body.message)
        .toBe("dueBefore must be a valid date in YYYY-MM-DD format");
    expect(invalidBeforeResponse.body.data).toBeNull();

    // -------------------------
    // Invalid dueAfter format
    // -------------------------

    const invalidAfterResponse = await request(app)
        .get("/tasks?dueAfter=not-a-date")
        .set("Authorization", `Bearer ${token}`);

    expect(invalidAfterResponse.statusCode).toBe(400);
    expect(invalidAfterResponse.body.success).toBe(false);
    expect(invalidAfterResponse.body.message)
        .toBe("dueAfter must be a valid date in YYYY-MM-DD format");
    expect(invalidAfterResponse.body.data).toBeNull();

    // -------------------------
    // Invalid date range
    // -------------------------

    const invalidRangeResponse = await request(app)
        .get("/tasks?dueAfter=2026-03-01&dueBefore=2026-02-01")
        .set("Authorization", `Bearer ${token}`);

    expect(invalidRangeResponse.statusCode).toBe(400);
    expect(invalidRangeResponse.body.success).toBe(false);
    expect(invalidRangeResponse.body.message)
        .toBe("dueBefore must be later than dueAfter");
    expect(invalidRangeResponse.body.data).toBeNull();
});

test("GET /tasks should filter overdue tasks correctly", async () => {

    const email = `overdue${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Overdue Test User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    const token = loginResponse.body.data.token;

    // Create an overdue incomplete task
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Overdue Task",
            dueDate: "2026-01-10",
            completed: false
        });

    // Create an overdue completed task
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Completed Overdue Task",
            dueDate: "2026-01-05",
            completed: true
        });

    // Create a future incomplete task
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Future Task",
            dueDate: "2099-01-01",
            completed: false
        });

    // Create a task without a due date
    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "No Due Date Task",
            completed: false
        });

    const response = await request(app)
        .get("/tasks?overdue=true")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.tasks).toHaveLength(1);

    expect(response.body.data.tasks[0].title)
        .toBe("Overdue Task");

    expect(response.body.data.tasks[0].completed)
        .toBe(false);

    expect(response.body.data.tasks[0].dueDate)
        .toBeDefined();
});

test("GET /tasks should return empty results and exclude soft-deleted tasks", async () => {

    const email = `emptyresults${Date.now()}@example.com`;

    // Register user
    const registerResponse = await request(app)
        .post("/users/register")
        .send({
            name: "Empty Results User",
            email,
            password: "TestPassword123"
        });


    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

  

    const token = loginResponse.body.data.token;

    // Create a task that will be soft-deleted
    const taskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Deleted Task",
            description: "This task should not appear in GET /tasks"
        });

   

    const taskId = taskResponse.body.data._id;

    // Create a normal active task
    const activeTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Active Task",
            description: "This task should appear"
        });

   

    // Soft-delete the first task
    const deleteResponse = await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

    

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // Normal GET should exclude the deleted task
    const activeTasksResponse = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${token}`);

    

    expect(activeTasksResponse.statusCode).toBe(200);
    expect(activeTasksResponse.body.success).toBe(true);

    expect(activeTasksResponse.body.data.totalTasks)
        .toBe(1);

    expect(activeTasksResponse.body.data.tasks)
        .toHaveLength(1);

    expect(activeTasksResponse.body.data.tasks[0].title)
        .toBe("Active Task");

    // Search specifically for the deleted task
    const deletedSearchResponse = await request(app)
        .get("/tasks?search=Deleted")
        .set("Authorization", `Bearer ${token}`);

    

    expect(deletedSearchResponse.statusCode).toBe(200);
    expect(deletedSearchResponse.body.success).toBe(true);

    expect(deletedSearchResponse.body.data.totalTasks)
        .toBe(0);

    expect(deletedSearchResponse.body.data.tasks)
        .toHaveLength(0);

    // A valid filter with no matching task
    

    const emptyFilterResponse = await request(app)
        .get("/tasks?priority=high")
        .set("Authorization", `Bearer ${token}`);

  
   

    expect(emptyFilterResponse.statusCode).toBe(200);
    expect(emptyFilterResponse.body.success).toBe(true);

    expect(emptyFilterResponse.body.data.totalTasks)
        .toBe(0);

    expect(emptyFilterResponse.body.data.tasks)
        .toEqual([]);
});

test("POST /users/register should reject missing name", async () => {

    const response = await request(app)
        .post("/users/register")
        .send({
            email: `missingname${Date.now()}@example.com`,
            password: "TestPassword123"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message)
        .toBe("Name is required and must be a string");

    expect(response.body.data).toBeNull();
});

test("POST /users/register should reject password shorter than 6 characters", async () => {

    const response = await request(app)
        .post("/users/register")
        .send({
            name: "Short Password User",
            email: `shortpassword${Date.now()}@example.com`,
            password: "12345"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message)
        .toBe("Password must be at least 6 characters");

    expect(response.body.data).toBeNull();
});

test("POST /users/register should normalize email and protect password", async () => {

    const email = `  Normalize${Date.now()}@Example.COM  `;

    const response = await request(app)
        .post("/users/register")
        .send({
            name: "Normalize Email User",
            email,
            password: "TestPassword123"
        });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message)
        .toBe("User registered successfully");

    expect(response.body.data.email)
        .toBe(email.trim().toLowerCase());

    expect(response.body.data)
        .not.toHaveProperty("password");
});

test("POST /users/login should reject missing login credentials", async () => {

    // Missing email
    const missingEmailResponse = await request(app)
        .post("/users/login")
        .send({
            password: "TestPassword123"
        });

    expect(missingEmailResponse.statusCode).toBe(400);

    expect(missingEmailResponse.body.success).toBe(false);

    expect(missingEmailResponse.body.message)
        .toBe("Email and password are required");

    expect(missingEmailResponse.body.data).toBeNull();


    // Missing password
    const missingPasswordResponse = await request(app)
        .post("/users/login")
        .send({
            email: `missingpassword${Date.now()}@example.com`
        });

    expect(missingPasswordResponse.statusCode).toBe(400);

    expect(missingPasswordResponse.body.success).toBe(false);

    expect(missingPasswordResponse.body.message)
        .toBe("Email and password are required");

    expect(missingPasswordResponse.body.data).toBeNull();


    // Both email and password missing
    const missingBothResponse = await request(app)
        .post("/users/login")
        .send({});

    expect(missingBothResponse.statusCode).toBe(400);

    expect(missingBothResponse.body.success).toBe(false);

    expect(missingBothResponse.body.message)
        .toBe("Email and password are required");

    expect(missingBothResponse.body.data).toBeNull();
});

test("POST /users/refresh should generate new access and refresh tokens", async () => {

    const email = `refresh${Date.now()}@example.com`;

    // Register user
    const registerResponse = await request(app)
        .post("/users/register")
        .send({
            name: "Refresh Token User",
            email,
            password: "TestPassword123"
        });

    expect(registerResponse.statusCode).toBe(201);

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const oldAccessToken = loginResponse.body.data.token;
    const oldRefreshToken = loginResponse.body.data.refreshToken;

    expect(oldAccessToken).toBeDefined();
    expect(oldRefreshToken).toBeDefined();

    // Refresh tokens
    const refreshResponse = await request(app)
        .post("/users/refresh")
        .send({
            refreshToken: oldRefreshToken
        });

    expect(refreshResponse.statusCode).toBe(200);

    expect(refreshResponse.body.success).toBe(true);

    expect(refreshResponse.body.message).toBe(
        "Access token refreshed successfully"
    );

    expect(refreshResponse.body.data).toBeDefined();

    expect(refreshResponse.body.data.token).toBeDefined();

    expect(refreshResponse.body.data.refreshToken).toBeDefined();

    // New tokens should be different from old tokens
    expect(refreshResponse.body.data.token)
        .not.toBe(oldAccessToken);

    expect(refreshResponse.body.data.refreshToken)
        .not.toBe(oldRefreshToken);
});

test("POST /tasks should create a task with supported fields", async () => {

    const email = `createfields${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Create Fields User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create task with supported fields
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Complete backend testing",
            description: "Finish important Phase 8 tests",
            completed: false,
            priority: "high",
            tags: ["backend", "testing"],
            category: "Development",
            dueDate: "2026-12-31T12:00:00.000Z"
        });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toBeDefined();

    expect(response.body.data.title).toBe(
        "Complete backend testing"
    );

    expect(response.body.data.description).toBe(
        "Finish important Phase 8 tests"
    );

    expect(response.body.data.completed).toBe(false);

    expect(response.body.data.priority).toBe("high");

    expect(response.body.data.tags).toEqual([
        "backend",
        "testing"
    ]);

    expect(response.body.data.category).toBe(
        "development"
    );

    expect(response.body.data.dueDate).toBeDefined();
});

test("GET /tasks/:id should handle existing, missing, invalid, and deleted tasks", async () => {

    const email = `getbyid${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Get By ID User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create a task
    const createResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task for get by ID test"
        });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data._id;

    // 1. Existing task
    const existingResponse = await request(app)
        .get(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(existingResponse.statusCode).toBe(200);
    expect(existingResponse.body.success).toBe(true);
    expect(existingResponse.body.data._id).toBe(taskId);

    // 2. Non-existent but valid ObjectId
    const missingResponse = await request(app)
        .get("/tasks/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

    expect(missingResponse.statusCode).toBe(404);
    expect(missingResponse.body.success).toBe(false);
    expect(missingResponse.body.data).toBeNull();

    // 3. Invalid ObjectId
    const invalidResponse = await request(app)
        .get("/tasks/not-a-valid-id")
        .set("Authorization", `Bearer ${token}`);

    expect(invalidResponse.statusCode).toBe(400);
    expect(invalidResponse.body.success).toBe(false);
    expect(invalidResponse.body.message).toBe(
        "Invalid task ID"
    );
    expect(invalidResponse.body.data).toBeNull();

    // 4. Soft delete the task
    const deleteResponse = await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);

    // 5. Deleted task should no longer be accessible
    const deletedResponse = await request(app)
        .get(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(deletedResponse.statusCode).toBe(404);
    expect(deletedResponse.body.success).toBe(false);
    expect(deletedResponse.body.data).toBeNull();
});

test("PATCH /tasks/:id should update task fields and enforce ownership", async () => {

    const email = `updatetask${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Update Task User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create task
    const createResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Original task",
            description: "Original description",
            priority: "low"
        });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data._id;

    // Update task
    const updateResponse = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Updated task",
            description: "Updated description",
            priority: "high",
            completed: true
        });

    expect(updateResponse.statusCode).toBe(200);

    expect(updateResponse.body.success).toBe(true);

    expect(updateResponse.body.data).toBeDefined();

    expect(updateResponse.body.data._id).toBe(taskId);

    expect(updateResponse.body.data.title).toBe(
        "Updated task"
    );

    expect(updateResponse.body.data.description).toBe(
        "Updated description"
    );

    expect(updateResponse.body.data.priority).toBe(
        "high"
    );

    expect(updateResponse.body.data.completed).toBe(true);

    // Register second user
    const secondEmail = `updateother${Date.now()}@example.com`;

    await request(app)
        .post("/users/register")
        .send({
            name: "Other User",
            email: secondEmail,
            password: "TestPassword123"
        });

    // Login second user
    const secondLoginResponse = await request(app)
        .post("/users/login")
        .send({
            email: secondEmail,
            password: "TestPassword123"
        });

    expect(secondLoginResponse.statusCode).toBe(200);

    const secondToken = secondLoginResponse.body.data.token;

    // Second user tries to update first user's task
    const unauthorizedUpdateResponse = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${secondToken}`)
        .send({
            title: "Unauthorized update"
        });

    expect(unauthorizedUpdateResponse.statusCode).toBe(404);

    expect(unauthorizedUpdateResponse.body.success).toBe(false);

    expect(unauthorizedUpdateResponse.body.data).toBeNull();
});

test("PATCH /tasks/:id should schedule the next due date for recurring tasks", async () => {

    const email = `recurring${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Recurring Task User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Helper to create a recurring task
    const createRecurringTask = async (frequency, dueDate) => {

        const response = await request(app)
            .post("/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: `${frequency} recurring task`,
                dueDate,
                recurring: {
                    enabled: true,
                    frequency
                }
            });

        expect(response.statusCode).toBe(201);

        return response.body.data;
    };

    // DAILY
    const dailyDueDate = "2026-10-01T12:00:00.000Z";

    const dailyTask = await createRecurringTask(
        "daily",
        dailyDueDate
    );

    const dailyResponse = await request(app)
        .patch(`/tasks/${dailyTask._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            completed: true
        });

    expect(dailyResponse.statusCode).toBe(200);

    expect(dailyResponse.body.data.completed).toBe(false);

    expect(
        new Date(dailyResponse.body.data.dueDate).toISOString()
    ).toBe("2026-10-02T12:00:00.000Z");


    // WEEKLY
    const weeklyDueDate = "2026-10-01T12:00:00.000Z";

    const weeklyTask = await createRecurringTask(
        "weekly",
        weeklyDueDate
    );

    const weeklyResponse = await request(app)
        .patch(`/tasks/${weeklyTask._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            completed: true
        });

    expect(weeklyResponse.statusCode).toBe(200);

    expect(weeklyResponse.body.data.completed).toBe(false);

    expect(
        new Date(weeklyResponse.body.data.dueDate).toISOString()
    ).toBe("2026-10-08T12:00:00.000Z");


    // MONTHLY
    const monthlyDueDate = "2026-10-15T12:00:00.000Z";

    const monthlyTask = await createRecurringTask(
        "monthly",
        monthlyDueDate
    );

    const monthlyResponse = await request(app)
        .patch(`/tasks/${monthlyTask._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            completed: true
        });

    expect(monthlyResponse.statusCode).toBe(200);

    expect(monthlyResponse.body.data.completed).toBe(false);

    expect(
        new Date(monthlyResponse.body.data.dueDate).toISOString()
    ).toBe("2026-11-15T12:00:00.000Z");
});

test("POST /tasks/:id/restore should restore a soft-deleted task", async () => {

    const email = `restore${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Restore Task User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create task
    const createResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Task to restore"
        });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data._id;

    // Soft delete task
    const deleteResponse = await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);

    // Verify task is no longer accessible
    const deletedResponse = await request(app)
        .get(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(deletedResponse.statusCode).toBe(404);

    // Restore task
    const restoreResponse = await request(app)
        .post(`/tasks/${taskId}/restore`)
        .set("Authorization", `Bearer ${token}`);

    expect(restoreResponse.statusCode).toBe(200);

    expect(restoreResponse.body.success).toBe(true);

    expect(restoreResponse.body.data).toBeDefined();

    expect(restoreResponse.body.data._id).toBe(taskId);

    // Verify task is accessible again
    const restoredResponse = await request(app)
        .get(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(restoredResponse.statusCode).toBe(200);

    expect(restoredResponse.body.success).toBe(true);

    expect(restoredResponse.body.data._id).toBe(taskId);

    expect(restoredResponse.body.data.title).toBe(
        "Task to restore"
    );
});

test("PATCH /tasks/bulk should update multiple tasks and enforce ownership", async () => {

    const email = `bulkupdate${Date.now()}@example.com`;

    // Register first user
    await request(app)
        .post("/users/register")
        .send({
            name: "Bulk Update User",
            email,
            password: "TestPassword123"
        });

    // Login first user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create first task
    const firstTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Bulk task one",
            priority: "low"
        });

    expect(firstTaskResponse.statusCode).toBe(201);

    // Create second task
    const secondTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Bulk task two",
            priority: "low"
        });

    expect(secondTaskResponse.statusCode).toBe(201);

    const firstTaskId = firstTaskResponse.body.data._id;
    const secondTaskId = secondTaskResponse.body.data._id;

    // Bulk update both tasks
    const bulkUpdateResponse = await request(app)
        .patch("/tasks/bulk")
        .set("Authorization", `Bearer ${token}`)
        .send({
            taskIds: [
                firstTaskId,
                secondTaskId
            ],
            updates: {
                completed: true,
                priority: "high"
            }
        });

    expect(bulkUpdateResponse.statusCode).toBe(200);

    expect(bulkUpdateResponse.body.success).toBe(true);

    expect(bulkUpdateResponse.body.data).toBeDefined();

    expect(bulkUpdateResponse.body.data.modifiedCount).toBe(2);

    // Verify first task
    const firstTaskCheck = await request(app)
        .get(`/tasks/${firstTaskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(firstTaskCheck.statusCode).toBe(200);

    expect(firstTaskCheck.body.data.completed).toBe(true);

    expect(firstTaskCheck.body.data.priority).toBe("high");

    // Verify second task
    const secondTaskCheck = await request(app)
        .get(`/tasks/${secondTaskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(secondTaskCheck.statusCode).toBe(200);

    expect(secondTaskCheck.body.data.completed).toBe(true);

    expect(secondTaskCheck.body.data.priority).toBe("high");


    // Register second user
    const secondEmail = `bulkother${Date.now()}@example.com`;

    await request(app)
        .post("/users/register")
        .send({
            name: "Other Bulk User",
            email: secondEmail,
            password: "TestPassword123"
        });

    // Login second user
    const secondLoginResponse = await request(app)
        .post("/users/login")
        .send({
            email: secondEmail,
            password: "TestPassword123"
        });

    expect(secondLoginResponse.statusCode).toBe(200);

    const secondToken = secondLoginResponse.body.data.token;

    // Second user tries to update first user's task
    const unauthorizedResponse = await request(app)
        .patch("/tasks/bulk")
        .set("Authorization", `Bearer ${secondToken}`)
        .send({
            taskIds: [
                firstTaskId
            ],
            updates: {
                completed: false
            }
        });

    expect(unauthorizedResponse.statusCode).toBe(404);

    expect(unauthorizedResponse.body.success).toBe(false);

    expect(unauthorizedResponse.body.data).toBeNull();
});

test("DELETE /tasks/bulk should delete multiple tasks and enforce ownership", async () => {

    const email = `bulkdelete${Date.now()}@example.com`;

    // Register first user
    await request(app)
        .post("/users/register")
        .send({
            name: "Bulk Delete User",
            email,
            password: "TestPassword123"
        });

    // Login first user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create first task
    const firstTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Bulk delete task one"
        });

    expect(firstTaskResponse.statusCode).toBe(201);

    // Create second task
    const secondTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Bulk delete task two"
        });

    expect(secondTaskResponse.statusCode).toBe(201);

    const firstTaskId = firstTaskResponse.body.data._id;
    const secondTaskId = secondTaskResponse.body.data._id;

    // Bulk delete both tasks
    const bulkDeleteResponse = await request(app)
        .delete("/tasks/bulk")
        .set("Authorization", `Bearer ${token}`)
        .send({
            taskIds: [
                firstTaskId,
                secondTaskId
            ]
        });

    expect(bulkDeleteResponse.statusCode).toBe(200);

    expect(bulkDeleteResponse.body.success).toBe(true);

    expect(bulkDeleteResponse.body.data).toBeDefined();

    expect(bulkDeleteResponse.body.data.modifiedCount).toBe(2);

    // Verify first task is soft-deleted
    const firstTaskCheck = await request(app)
        .get(`/tasks/${firstTaskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(firstTaskCheck.statusCode).toBe(404);

    // Verify second task is soft-deleted
    const secondTaskCheck = await request(app)
        .get(`/tasks/${secondTaskId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(secondTaskCheck.statusCode).toBe(404);


    // Register second user
    const secondEmail = `bulkdeleteother${Date.now()}@example.com`;

    await request(app)
        .post("/users/register")
        .send({
            name: "Other Bulk Delete User",
            email: secondEmail,
            password: "TestPassword123"
        });

    // Login second user
    const secondLoginResponse = await request(app)
        .post("/users/login")
        .send({
            email: secondEmail,
            password: "TestPassword123"
        });

    expect(secondLoginResponse.statusCode).toBe(200);

    const secondToken = secondLoginResponse.body.data.token;

    // Second user tries to delete first user's task
    // The task is already deleted, so this also verifies
    // that deleted tasks cannot be deleted again.
    const unauthorizedResponse = await request(app)
        .delete("/tasks/bulk")
        .set("Authorization", `Bearer ${secondToken}`)
        .send({
            taskIds: [
                firstTaskId
            ]
        });

    expect(unauthorizedResponse.statusCode).toBe(404);

    expect(unauthorizedResponse.body.success).toBe(false);

    expect(unauthorizedResponse.body.data).toBeNull();
});

test("GET /tasks/stats should return statistics for authenticated user's tasks", async () => {

    const email = `stats${Date.now()}@example.com`;

    // Register user
    await request(app)
        .post("/users/register")
        .send({
            name: "Stats User",
            email,
            password: "TestPassword123"
        });

    // Login user
    const loginResponse = await request(app)
        .post("/users/login")
        .send({
            email,
            password: "TestPassword123"
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create incomplete task
    const firstTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Incomplete task",
            completed: false
        });

    expect(firstTaskResponse.statusCode).toBe(201);

    // Create completed task
    const secondTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Completed task",
            completed: true
        });

    expect(secondTaskResponse.statusCode).toBe(201);

    // Get statistics
    const statsResponse = await request(app)
        .get("/tasks/stats")
        .set("Authorization", `Bearer ${token}`);

    expect(statsResponse.statusCode).toBe(200);

    expect(statsResponse.body.success).toBe(true);

    expect(statsResponse.body.data).toBeDefined();

    expect(statsResponse.body.data.totalTasks).toBe(2);

    expect(statsResponse.body.data.completedTasks).toBe(1);

    expect(statsResponse.body.data.pendingTasks).toBe(1);
});

test("Unknown route should return a 404 response", async () => {

    const response = await request(app)
        .get("/this-route-does-not-exist");

    expect(response.statusCode).toBe(404);
});

test("API should reject request bodies larger than 10 KB", async () => {

    const largeDescription = "A".repeat(11 * 1024);

    const response = await request(app)
        .post("/users/register")
        .send({
            name: "Large Body User",
            email: `largebody${Date.now()}@example.com`,
            password: "TestPassword123",
            description: largeDescription
        });

    expect(response.statusCode).toBe(413);
});