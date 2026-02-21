import mongoose from 'mongoose';

const teamSpaceSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    visibility: {
        type: String,
        enum: ['open', 'closed', 'private'],
        default: 'open',
    },
    archived: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    size: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['personal', 'organization'],
        default: 'organization',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['Admin', 'Member', 'Viewer'],
            default: 'Member',
        }
    }],
    pendingInvites: [{
        email: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Admin', 'Member', 'Viewer'],
            default: 'Member',
        },
        clerkInvitationId: {
            type: String,
        },
        invitedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    teamSpaces: {
        type: [teamSpaceSchema],
        default: [{ id: 'general', name: 'General', visibility: 'open', archived: false }],
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

export const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
