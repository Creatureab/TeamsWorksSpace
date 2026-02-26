import mongoose from 'mongoose';

const teamSpaceMemberSchema = new mongoose.Schema({
    clerkId: { type: String, required: true },
    role: {
        type: String,
        enum: ['owner', 'member', 'guest'],
        default: 'member',
    },
    joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const teamSpaceSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    // LEGACY — kept for backwards compat; new code uses accessType
    visibility: {
        type: String,
        enum: ['open', 'closed', 'private'],
        default: 'open',
    },
    // NEW access type (mirrors visibility; update both together)
    accessType: {
        type: String,
        enum: ['open', 'closed', 'private'],
        default: 'open',
    },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    // clerkId of the creator (not required on existing docs)
    createdBy: { type: String, default: null },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    members: { type: [teamSpaceMemberSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
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
        default: [{
            id: 'general',
            name: 'General',
            visibility: 'open',
            accessType: 'open',
            description: '',
            icon: '',
            createdBy: null,
            archived: false,
            archivedAt: null,
            members: [],
            createdAt: Date.now,
            updatedAt: Date.now,
        }],
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

// Ensure teamSpace ids are unique within a workspace document
workspaceSchema.path('teamSpaces').validate(function (teamSpaces: { id?: string }[] | undefined) {
    if (!Array.isArray(teamSpaces)) return true;
    const seen = new Set<string>();
    for (const space of teamSpaces) {
        if (!space?.id) continue;
        if (seen.has(space.id)) return false;
        seen.add(space.id);
    }
    return true;
}, 'Team space ids must be unique within a workspace');

export const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
