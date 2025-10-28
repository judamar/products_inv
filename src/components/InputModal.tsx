import { useState, useEffect } from 'react';
import { supabase } from '../database/SupabaseClient.ts'

interface FormData {
    nombre: string;
    precio: string;
    marca: string;
    categoria: string;
}

interface Categoria {
    id: string;
    name: string;
}

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: FormData) => void;
}

export default function InputModal({ isOpen, onClose, onSave }: InputModalProps) {
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        precio: '',
        marca: '',
        categoria: ''
    });

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(false);

    // Cargar categorías desde Supabase
    useEffect(() => {
        if (isOpen) {
            fetchCategorias();
        }
    }, [isOpen]);

    const fetchCategorias = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error al cargar categorías:', error);
                return;
            }

            if (data) {
                setCategorias(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.nombre || !formData.precio || !formData.categoria || !formData.marca) {
            alert('Por favor completa todos los campos');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('products')
                .insert([
                    {
                        name: formData.nombre,
                        price: parseFloat(formData.precio),
                        label: formData.marca,
                        category_id: formData.categoria // Ahora guarda el ID
                    }
                ])
                .select();

            if (error) {
                console.error('Error al guardar:', error);
                alert('Error al guardar el producto: ' + error.message);
                setLoading(false);
                return;
            }

            console.log('Producto guardado exitosamente:', data);
            alert('Producto guardado exitosamente!');

            // Llamar callback si existe
            if (onSave) {
                onSave(formData);
            }

            // Limpiar formulario
            setFormData({
                nombre: '',
                precio: '',
                marca: '',
                categoria: ''
            });

            onClose();

        } catch (error) {
            console.error('Error inesperado:', error);
            alert('Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Limpiar formulario al cerrar
        setFormData({
            nombre: '',
            precio: '',
            marca: '',
            categoria: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className='fixed inset-0 bg-gray-800/30 z-40 transition-opacity'
                onClick={handleClose}
            />

            {/* Modal */}
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                <div className='bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all'>
                    {/* Header */}
                    <div className='flex items-center justify-between p-6 border-b'>
                        <h2 className='text-2xl font-bold text-gray-800'>Agregar Producto</h2>
                        <button
                            onClick={handleClose}
                            className='text-gray-400 hover:text-gray-600 transition'
                            aria-label='Close'
                        >
                            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className='p-6 space-y-5'>
                        <div>
                            <label htmlFor='nombre' className='block text-sm font-medium text-gray-700 mb-2'>
                                Nombre del Producto
                            </label>
                            <input
                                type='text'
                                id='nombre'
                                name='nombre'
                                value={formData.nombre}
                                onChange={handleChange}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition'
                                placeholder='Nombre del producto'
                            />
                        </div>

                        <div>
                            <label htmlFor='precio' className='block text-sm font-medium text-gray-700 mb-2'>
                                Precio
                            </label>
                            <input
                                type='number'
                                id='precio'
                                name='precio'
                                value={formData.precio}
                                onChange={handleChange}
                                min='0'
                                step='0.01'
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition'
                                placeholder='$0'
                            />
                        </div>

                        <div>
                            <label htmlFor='label' className='block text-sm font-medium text-gray-700 mb-2'>
                                Marca
                            </label>
                            <input
                                type='text'
                                id='marca'
                                name='marca'
                                value={formData.marca}
                                onChange={handleChange}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition'
                                placeholder='Marca del producto'
                            />
                        </div>

                        <div>
                            <label htmlFor='categoria' className='block text-sm font-medium text-gray-700 mb-2'>
                                Categoría
                            </label>
                            <select
                                id='categoria'
                                name='categoria'
                                value={formData.categoria}
                                onChange={handleChange}
                                disabled={categorias.length === 0}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition bg-white disabled:opacity-50'
                            >
                                <option value=''>
                                    {categorias.length === 0 ? 'Cargando categorías...' : 'Selecciona una categoría'}
                                </option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='flex gap-3 p-6 border-t'>
                        <button
                            onClick={handleClose}
                            className='flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition duration-200'
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className='flex-1 bg-green-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-900 focus:ring-4 focus:ring-green-300 transition duration-200 disabled:opacity-50'
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}