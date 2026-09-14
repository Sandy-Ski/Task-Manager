const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({


    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {

        type: String,
        required: true,
        trim: true
    },

    description: {

        type: String,
        default: ""

    },

    completed: {

        type: Boolean,
        default: false
    },

    priority: {

        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
        
    },

    tags: {
        type: [String],
        default: []
    },

    category: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },

    dueDate: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    },

    reminder: {
        enabled: {
            type: Boolean,
            default: false
        },

        remindAt: {
            type: Date,
            default: null
        }
    },
    recurring: {
        enabled: {
            type: Boolean,
            default: false
        },

        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly"],
            default: null
        }
    }


},  {
      timestamps: true

});

taskSchema.index({
    user: 1,
    deletedAt: 1,
    createdAt: 1,
    _id: 1
});


const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
