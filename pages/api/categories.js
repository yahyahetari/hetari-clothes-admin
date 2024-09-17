import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(req, res);

    if (method === 'GET') {
        res.json(await Category.find().populate('parent'));
    }

    if (method === 'POST') {
        const { name, parentCategory, properties, tags, image } = req.body;
        const categoryDoc = await Category.create({
            name,
            parent: parentCategory || null,
            properties,
            tags,
            image // Add this line
        });
        res.json(categoryDoc);
    }

    if (method === 'PUT') {
        const { name, parentCategory, properties, tags, _id, image } = req.body;
        const categoryDoc = await Category.updateOne({ _id }, {
            name,
            parent: parentCategory || null,
            properties,
            tags,
            image // Add this line
        });
        res.json(categoryDoc);
    }

    if (method === 'DELETE') {
        const { id } = req.query;
        await Category.deleteOne({ _id: id });
        res.json(true);
    }
}
