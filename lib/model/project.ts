import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String },
    status: { type: String, default: 'todo' },
    priority: { type: String, default: 'medium' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

const sheetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tasks: [taskSchema],
});

const projectSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    privacy: {
        type: String,
        enum: ['workspace', 'private'],
        default: 'workspace',
    },
    automation: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    teamSpaceId: {
        type: String,
        default: null,
    },
    sheets: {
        type: [sheetSchema],
        default: [{ name: 'Default Sheet', tasks: [] }]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

projectSchema.index({ workspace: 1, slug: 1 }, { unique: true });
projectSchema.index({ workspace: 1, teamSpaceId: 1 });

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
