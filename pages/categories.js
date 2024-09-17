import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PenBox, Trash2, X, Upload } from "lucide-react";
import Loader from "@/components/Loader";

export default function Categories({ scrollToTop }) {
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [properties, setProperties] = useState([]);
    const [tagsInput, setTagsInput] = useState('');
    const [tags, setTags] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [image, setImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [nameError, setNameError] = useState(false); // حالة للتحقق من وجود خطأ في الاسم
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        axios.get('/api/categories')
            .then(result => {
                setCategories(result.data);
            });
    }

    async function saveCategory(ev) {
        ev.preventDefault();

        if (!name) {
            setNameError(true);
            return;
        }

        const data = {
            name,
            parentCategory,
            properties: properties.map(property => ({
                name: property.name,
                values: property.values.split(','),
            })),
            tags,
            image
        };

        if (editingCategory) {
            data._id = editingCategory._id;
            await axios.put('/api/categories', data);
            setEditingCategory(null);
        } else {
            await axios.post('/api/categories', data);
        }

        setName('');
        setParentCategory('');
        setProperties([]);
        setTags([]);
        setTagsInput('');
        setImage('');
        setNameError(false); // إعادة تعيين حالة الخطأ
        fetchCategories();
    }

    function editCategory(category) {
        setEditingCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(category.properties.map(({ name, values }) => ({
            name,
            values: values.join(',')
        })));
        setTags(category.tags || []);
        setTagsInput(category.tags ? category.tags.join(', ') : '');
        setImage(category.image || '');
    }

    function confirmDeleteCategory(category) {
        setCategoryToDelete(category);
        scrollToTop();
    }

    async function deleteCategory() {
        await axios.delete('/api/categories?id=' + categoryToDelete._id);
        setCategoryToDelete(null);
        fetchCategories();
    }

    function cancelDelete() {
        setCategoryToDelete(null);
    }

    function addProperty() {
        setProperties(prev => [...prev, { name: '', values: '' }]);
    }

    function handlePropertyChange(index, field, value) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index][field] = value;
            return properties;
        });
    }

    function removeProperty(indexToRemove) {
        setProperties(prev => prev.filter((_, pIndex) => pIndex !== indexToRemove));
    }

    function handleTagInputChange(ev) {
        setTagsInput(ev.target.value);
    }

    function handleTagInputKeyDown(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            const newTags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag && !tags.includes(tag));
            setTags(prevTags => [...prevTags, ...newTags]);
            setTagsInput('');
        }
    }

    function removeTag(tagToRemove) {
        setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
    }

    async function uploadImage(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            const res = await axios.post('/api/upload', data);
            setImage(res.data.Links[0]);
            setIsUploading(false);
        }
    }

    async function removeImage() {
        setImage('');
    }

    return (
        <div>
            <h1>Categories page</h1>
            <label className="mt-4 ml-3">{editingCategory ? `Edit Category ${editingCategory.name}` : 'Create New Categories'}</label>
            <form onSubmit={saveCategory} className="mb-2">
                <div className="flex gap-1 mb-2">
                    <input
                        type="text"
                        placeholder="Category Name"
                        onChange={ev => {
                            setName(ev.target.value);
                            setNameError(false); // إعادة تعيين حالة الخطأ عند التغيير
                        }}
                        value={name}
                        className={nameError ? 'border-red-500' : ''} // إضافة بوردر أحمر في حالة الخطأ
                    />
                    <select
                        className="ml-2 text-white bg-glass"
                        onChange={ev => setParentCategory(ev.target.value)}
                        value={parentCategory}
                    >
                        <option className="bg-black hover:bg-cyan-950" value="">No parent category</option>
                        {categories.length > 0 && categories
                            .filter(category => !editingCategory || category._id !== editingCategory._id)
                            .map(category => (
                                <option className="bg-black hover:bg-cyan-950" key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block mb-1">Properties</label>
                    <button type="button" onClick={addProperty} className="btn-default mb-2">Add New Property</button>
                    {properties.length > 0 && properties.map((property, index) => (
                        <div className="flex gap-1 mb-2" key={index}>
                            <input
                                type="text"
                                className="mb-0"
                                placeholder="Property Name"
                                value={property.name}
                                onChange={ev => handlePropertyChange(index, 'name', ev.target.value)}
                            />
                            <input
                                type="text"
                                className="mb-0"
                                placeholder="Property Values (comma separated)"
                                value={property.values}
                                onChange={ev => handlePropertyChange(index, 'values', ev.target.value)}
                            />
                            <button type="button" onClick={() => removeProperty(index)} className="btn-red">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mb-2">
                    <label className="block mb-1">Tags (comma separated)</label>
                    <input
                        type="text"
                        placeholder="Enter tags separated by commas"
                        value={tagsInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagInputKeyDown}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-sm flex items-center">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mb-2">
                    <label className="block mb-1">Category Image</label>
                    <div className="flex items-center gap-2">
                        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-slate-900 rounded-lg bg-h-glass shadow-lg">
                            <Upload className="w-6 h-6" />
                            <div>{image ? 'Change image' : 'Add image'}</div>
                            <input type="file" onChange={uploadImage} className="hidden" />
                        </label>
                        {isUploading && (
                            <div className="h-24 flex items-center">
                                <Loader />
                            </div>
                        )}
                        {image && (
                            <div className="relative">
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-3 -right-3 bg-red-700 text-white p-1 rounded-full z-10 shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="h-24 w-24 bg-white shadow-sm rounded-full border border-gray-200 overflow-hidden">
                                    <img
                                        src={image}
                                        alt=""
                                        className="h-full w-full object-cover object-top"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {editingCategory && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingCategory(null);
                            setName('');
                            setParentCategory('');
                            setProperties([]);
                            setTags([]);
                            setTagsInput('');
                            setImage('');
                        }}
                        className="btn-default mr-2">
                        Cancel
                    </button>
                )}
                <button className="bg-cyan-800 p-2 h-10 m-1 rounded-lg py-2">Save</button>
            </form>

            {!editingCategory && (
                <table className="basic">
                    <thead>
                        <tr>
                            <td>Category Name</td>
                            <td>Parent Category</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 && categories.map(category => (
                            <tr key={category._id}>
                                <td>{category.name}</td>
                                <td>{category?.parent?.name}</td>
                                <td className="text-center">
                                    <button onClick={() => editCategory(category)} className="inline-flex text-white px-2 rounded-lg py-2 bg-h-glass hover:bg-glass">
                                        <PenBox className="w-5 h-7 mr-1 pb-1" />
                                        Edit
                                    </button>
                                </td>
                                <td className="text-center">
                                    <button onClick={() => confirmDeleteCategory(category)} className="inline-flex text-white px-2 rounded-lg py-2 bg-red-900 hover:bg-h-glass hover:font-bold hover:text-red-900">
                                        <Trash2 className="w-5 h-7 mr-1 pb-1" />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {categoryToDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                    <div className="max-w-sm p-6 bg-white bg-opacity-30 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">Delete Category</h5>
                        <p className="mb-4 text-gray-200">Are you sure you want to delete <span className="text-gray-950 font-semibold text-2xl">({categoryToDelete.name})</span>? This action cannot be undone.</p>
                        <div className="flex justify-between">
                            <button className="btn-red" onClick={deleteCategory}>Delete</button>
                            <button className="btn-default" onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
