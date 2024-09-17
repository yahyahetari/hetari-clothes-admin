import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect()
    await isAdminRequest(req,res)

    if (method === 'GET') {
        if(req.query?.id){
            const product = await Product.findById(req.query.id)
            return res.json(product)
        }else{
            res.json(await Product.find())
        }
    }

    if (method === 'POST') {
        try {
            const { title, description, price, cost, images, category, properties, tags } = req.body;
            const productDoc = await Product.create({
                title,
                description,
                price,
                cost, 
                images,
                category: category || null,
                properties,
                tags,
            })
            res.json(productDoc)
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ error: error.message });
        }
    }

    if(method === 'PUT'){
        try {
            const { title, description, price, cost, images, category, properties, tags, _id } = req.body;
            await Product.updateOne({_id}, {
                title,
                description,
                price,
                cost, 
                images,
                category: category || null, 
                properties,
                tags,
            })
            res.json(true)
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: error.message });
        }
    }

    if (method === 'DELETE'){
        try {
            const { id } = req.query
            await Product.deleteOne({ _id:req.query?.id })
            res.json(true)
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
