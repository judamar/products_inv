import { useState, useEffect } from 'react';
import { supabase } from '../database/SupabaseClient';
import InputModal from "./InputModal.tsx";

export interface Product {
    id: number;
    name: string;
    price: number;
    label: string;
    category_id: number;
}

interface Category {
    id: number;
    name: string;
}

export default function ProductTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, products]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('id, name');

            if (categoriesError) {
                console.error('Error al cargar categorías:', categoriesError);
            } else {
                setCategories(categoriesData || []);
            }

            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('category_id', { ascending: true });

            if (productsError) {
                console.error('Error al cargar productos:', productsError);
                alert('Error al cargar productos');
                return;
            }

            if (productsData) {
                const sorted = productsData.sort((a, b) => {
                    const categoryCompare = a.category_id - b.category_id;
                    if (categoryCompare !== 0) return categoryCompare;
                    return a.name.localeCompare(b.name);
                });

                setProducts(sorted);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (categoryId: number): string => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || 'Sin categoría';
    };

    const filterProducts = () => {
        if (!searchTerm.trim()) {
            setFilteredProducts(products);
            return;
        }

        const filtered = products.filter(product => {
            const categoryName = getCategoryName(product.category_id);
            return (
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                categoryName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        setFilteredProducts(filtered);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id: number, name: string) => {
        const confirmDelete = window.confirm(`¿Estás seguro de eliminar "${name}"?`);
        if (!confirmDelete) return;

        setDeleteLoading(id);

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el producto');
                return;
            }

            alert('Producto eliminado exitosamente');
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el producto');
        } finally {
            setDeleteLoading(null);
        }
    };

    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const categoryName = getCategoryName(product.category_id);
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-xl text-gray-600'>Cargando productos...</div>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload();
    };

    return (
        <div className='container mx-auto p-2 sm:p-4 md:p-6'>
            <div className='bg-white rounded-lg shadow-lg border-2 border-gray-700'>
                <div className='p-4 sm:p-6 border-b'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-3 sm:mb-4'>Inventario de Productos</h1>

                    <div className="flex justify-center items-center gap-5 mb-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='flex-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition duration-200 disabled:opacity-50'
                        >
                            Agregar Producto
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition duration-200 disabled:opacity-50"
                        >
                            Cerrar sesión
                        </button>
                    </div>

                    <InputModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        productToEdit={editingProduct}
                        onSave={fetchData}
                    />

                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Buscar...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full px-4 py-2 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition'
                        />
                        <svg
                            className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                    </div>

                    <div className='mt-2 text-xs sm:text-sm font-semibold text-gray-600'>
                        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    {Object.keys(groupedProducts).length === 0 ? (
                        <div className='p-8 sm:p-12 text-center text-gray-500'>
                            <svg className='mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                            </svg>
                            <p className='text-base sm:text-lg'>No se encontraron productos</p>
                        </div>
                    ) : (
                        Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                            <div key={category} className='mb-4 sm:mb-6'>
                                <div className='bg-green-700/90 px-4 sm:px-6 py-2 sm:py-3 border-t border-b'>
                                    <h2 className='text-base sm:text-lg text-center font-bold text-white'>{category}</h2>
                                </div>

                                <div className='hidden sm:block'>
                                    <table className='w-full'>
                                        <thead className='bg-green-700/20'>
                                        <tr>
                                            <th className='px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider'>
                                                Producto
                                            </th>
                                            <th className='px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider'>
                                                Marca
                                            </th>
                                            <th className='px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider'>
                                                Precio
                                            </th>
                                            <th className='px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider'>
                                                Acciones
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className='bg-white divide-y divide-gray-200'>
                                        {categoryProducts.map((product) => (
                                            <tr key={product.id} className='text-center hover:bg-green-200/80 transition'>
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                    <div className='text-sm font-medium text-gray-900'>{product.name}</div>
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                    <div className='text-sm text-gray-600'>{product.label}</div>
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                    <div className='text-sm font-semibold text-green-600'>
                                                        ${new Intl.NumberFormat('es-CO').format(product.price)}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-right'>
                                                    <div className='flex justify-end gap-2'>
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className='inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition'
                                                        >
                                                            <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                                            </svg>
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id, product.name)}
                                                            disabled={deleteLoading === product.id}
                                                            className='inline-flex items-center px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-300 transition disabled:opacity-50'
                                                        >
                                                            {deleteLoading === product.id ? (
                                                                <>
                                                                    <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
                                                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                                                    </svg>
                                                                    Eliminando...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                                    </svg>
                                                                    Eliminar
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='sm:hidden divide-y divide-gray-200'>
                                    {categoryProducts.map((product) => (
                                        <div key={product.id} className='p-4 hover:bg-gray-50 transition'>
                                            <div className='flex justify-between items-start mb-2'>
                                                <div className='flex-1'>
                                                    <div className='text-sm font-semibold text-gray-900 mb-1'>{product.name}</div>
                                                    <div className='text-xs text-gray-600 mb-2'>{product.label}</div>
                                                    <div className='text-base font-bold text-green-600'>
                                                        $ {product.price.toFixed(0)}
                                                    </div>
                                                </div>
                                                <div className='flex flex-col gap-1 ml-3'>
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className='p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition'
                                                    >
                                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        disabled={deleteLoading === product.id}
                                                        className='p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50'
                                                    >
                                                        {deleteLoading === product.id ? (
                                                            <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                                                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                                            </svg>
                                                        ) : (
                                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}