import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    parent: { type: mongoose.Types.ObjectId, ref: 'Category' },
    properties: [{ type: Object }],
    tags: [{ type: String }],
    image: { type: String }
}, {
    timestamps: true
});

function createSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
}

CategorySchema.pre('validate', async function(next) {
    if (this.name && (!this.slug || this.isModified('name'))) {
        let baseSlug = createSlug(this.name);
        let slug = baseSlug;
        let counter = 1;
        
        while (true) {
            const existingCategory = await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } });
            if (!existingCategory) {
                this.slug = slug;
                break;
            }
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }
    next();
});

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
