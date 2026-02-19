import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    pageId: {
        type: String,
        required: true,
        index: true,
    },
    workspaceId: {
        type: String,
        required: true,
        index: true,
    },
    parentBlockId: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        required: true,
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: '',
    },
    order: {
        type: Number,
        required: true,
    },
    checked: {
        type: Boolean,
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    color: {
        text: String,
        background: String,
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true
});

// Compound index for efficient page queries
blockSchema.index({ pageId: 1, order: 1 });

export const Block = mongoose.models.Block || mongoose.model('Block', blockSchema);
