import axios from "axios";
import { CircleFadingPlusIcon, PenBox, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;
    const router = useRouter();

    useEffect(() => {
        const page = parseInt(router.query.page) || 1;
        setCurrentPage(page);
    }, [router.query.page]);

    useEffect(() => {
        axios.get("/api/products")
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            router.push(`/products?page=${currentPage + 1}`);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            router.push(`/products?page=${currentPage - 1}`);
        }
    };

    return (
        <div>
            <div className="flex flex-col p-4">
                <h1 className="text-3xl font-semibold text-gray-200">Products</h1>
                <div className="flex justify-end mb-4">
                    <Link href="/products/new" legacyBehavior>
                        <a className="border rounded-lg bg-glas flex items-center font-semibold p-4">
                            <CircleFadingPlusIcon className="h-7 w-6 mr-2" />
                            Create Product
                        </a>
                    </Link>
                </div>
                
                <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="p-2 border border-gray-400 rounded w-full text-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table className="basic">
                    <thead>
                        <tr>
                            <td>Product Names</td>
                            <td className="w-6"></td>
                            <td className="w-6"></td>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map((product) => (
                            <tr key={product._id}>
                                <td className="text-lg">{product.title}</td>
                                <td>
                                    <Link href={`/products/edit/${product._id}?page=${currentPage}`} legacyBehavior>
                                        <a className="inline-flex text-white px-2 m-1 rounded-lg py-2 bg-h-glass hover:bg-glass">
                                            <PenBox className="w-5 h-7 sm:mr-1 pb-1" />
                                            <span className="hidden sm:inline">Edit</span> 
                                        </a>
                                    </Link>
                                </td>
                                <td>
                                    <Link href={`/products/delete/${product._id}?page=${currentPage}`} legacyBehavior>
                                        <a className="inline-flex text-white px-2 m-1 rounded-lg py-2 bg-red-900 hover:bg-h-glass hover:font-bold hover:text-red-900">
                                            <Trash2 className="w-5 h-7 sm:mr-1 pb-1" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </a>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between mt-4">
                    <button 
                        onClick={handlePreviousPage} 
                        disabled={currentPage === 1} 
                        className="bg-h-glass text-white px-4 py-2 rounded disabled:bg-glass">
                        Previous Page
                    </button>
                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages} 
                        className="bg-h-glass text-white px-4 py-2 rounded disabled:bg-glass">
                        Next Page
                    </button>
                </div>
            </div>
        </div>
    );
}
