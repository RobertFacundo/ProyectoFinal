console.log('Script de cliente cargado');

const socket = io();

// Actualizar la lista de productos en tiempo real
socket.on('updatedProducts', (products) => {
    console.log('Productos recibidos en el cliente', products);
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.textContent = `${product.title} - ${product.price}`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => deleteProduct(product.id);
        listItem.appendChild(deleteButton);
        productsList.appendChild(listItem);
    });
});

// Enviar nuevo producto vía WebSocket
document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const price = parseFloat(document.getElementById('price').value);

    console.log('Producto enviado desde el cliente:', { title, price }); // Verificar datos antes de enviarlos

    const newProduct = {
        title,
        price,
    };

    // Enviar el nuevo producto al servidor a través del WebSocket
    socket.emit('newProduct', newProduct);

    // Limpiar el formulario si es necesario
    e.target.reset();
});

function deleteProduct(productId) {
    socket.emit('deleteProduct', productId);
};