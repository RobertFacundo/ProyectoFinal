console.log('Script de cliente cargado');

const socket = io();

// Emitir los parámetros de consulta al conectarse
const queryParams = {
    limit: parseInt(new URLSearchParams(window.location.search).get('limit')) || 10,
    page: parseInt(new URLSearchParams(window.location.search).get('page')) || 1,
    sort: new URLSearchParams(window.location.search).get('sort'),
    category: new URLSearchParams(window.location.search).get('category')
};

socket.emit('setQueryParams', queryParams);

// Actualizar la lista de productos en tiempo real
socket.on('updatedProducts', (products) => {
    console.log('Productos recibidos en el cliente', products);
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = ''; // Limpiar la lista existente
    products.forEach(product => {
        const listItem = document.createElement('li');

        // Crear los elementos que necesitas según tu plantilla
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'cat';
        categoryDiv.textContent = product.category; // Asegúrate de que `category` exista en el producto

        const titleDiv = document.createElement('div');
        titleDiv.className = 'product-title';
        titleDiv.textContent = product.title; // Verifica que este campo sea correcto

        const priceDiv = document.createElement('div');
        priceDiv.className = 'product-price';
        priceDiv.textContent = `Precio: $${product.price}`; // Verifica que este campo sea correcto

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => deleteProduct(product._id); // Asegúrate de usar _id si es el campo correcto

        // Agregar los elementos al listItem
        listItem.appendChild(categoryDiv);
        listItem.appendChild(titleDiv);
        listItem.appendChild(priceDiv);
        listItem.appendChild(deleteButton);

        productsList.appendChild(listItem); // Agregar el elemento a la lista
    });
});

// Enviar nuevo producto vía WebSocket
document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const price = parseFloat(document.getElementById('price').value);
    const category = document.getElementById('category').value;

    console.log('Producto enviado desde el cliente:', { title, price, category }); // Verificar datos antes de enviarlos

    const newProduct = {
        title,
        price,
        category
    };

    // Enviar el nuevo producto al servidor a través del WebSocket
    socket.emit('newProduct', newProduct);

    // Limpiar el formulario si es necesario
    e.target.reset();
});

function deleteProduct(productId) {
    socket.emit('deleteProduct', productId);
};