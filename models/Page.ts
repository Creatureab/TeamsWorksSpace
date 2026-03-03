import mongoose from 'mongoose';

const BlockContentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['paragraph', 'heading', 'list', 'task', 'code', 'image'],
        required: true
    },
    content: { type: String, default: '' },
    properties: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const PageSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true },
    content: { type: [BlockContentSchema], default: [] },

    // Hierarchy (conscious denormalization for read performance)
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },
    path: { type: [String], required: true }, // ['docs', 'api', 'auth']
    level: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0, min: 0 },

    // Context
    workspaceId: { type: String, required: true },
    teamSpaceId: { type: String, default: null },

    // Metadata
    createdBy: { type: String, required: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
PageSchema.index({ workspaceId: 1, teamSpaceId: 1 });
PageSchema.index({ parentId: 1 });
PageSchema.index({ path: 1 });
PageSchema.index({ level: 1, order: 1 });

// Unique constraint: slug must be unique within same parent
PageSchema.index(
    { workspaceId: 1, teamSpaceId: 1, parentId: 1, slug: 1 },
    { unique: true }
);

// Unique constraint: path must be unique within workspace/teamspace
PageSchema.index(
    { workspaceId: 1, teamSpaceId: 1, path: 1 },
    { unique: true }
);

// Virtual for children
PageSchema.virtual('children', {
    ref: 'Page',
    localField: '_id',
    foreignField: 'parentId'
});

export const Page = mongoose.models.Page || mongoose.model('Page', PageSchema);