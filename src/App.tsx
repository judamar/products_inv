import {useState} from "react";
import InputModal from "./components/InputModal.tsx";
import ProductTable from "./components/ProductTable.tsx";

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload();
    };


    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className='bg-red-800 text-white px-4 py-2 rounded-lg'
                >
                    Agregar Producto
                </button>

                <button
                    onClick={handleLogout}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                    Cerrar sesión
                </button>
            </div>

            <InputModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <ProductTable />
        </div>
    );
}

export default App;
