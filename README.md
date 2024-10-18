# ProyectoFinal

## Descripción

Hola Profesor/es, tutor/es

El proyecto cuenta con dos persistencias de datos, para variar entre una u otra hay que, unicamente, cambiar el USE_MONGODB=true por false en el archivo de variables de entorno.

El proyecto esta configurado para que corra por defecto en el localhost:8080. Como objeto de prueba cargué a través de mongodbCompass con insertMany, decenas de productos para que sirvan de ejemplo. El ruteo principal de home muestra dichos productos paginados con mongoose, y links <a> con href hacia la pestaña de realTimeProducts, products y los carts.

Para poder verificar el agregado de productos a determinado carrito, se me ocurrió la idea de llamar cada id de los carts creados en la caja de cada producto y poder seleccionar en que carts agregar dicho producto, y asi verificar el método. (al agregar un producto se redirige hacia la pestaña del cart seleccionado en el id)

Tambien cree una ruta para poder agregar productos directamente desde postman con el id del cart y el id del producto

Cada producto tiene un opcion de "Ver detalles", que lleva a un handlebars donde se detalla cada producto, además de que los productos se pueden filtrar por categorias de manera ascendente y descendente.

La pestaña realtimeproducts permite agregar un producto dentro de las categorias permitidas.

La ruta /api/products muestra la primera pagina renderizada de los productos, y para poder utilizar los querys y que se muestre una respuesta json con el objeto pedido en el enunciado...

{
	status:success/error
payload: Resultado de los productos solicitados
totalPages: Total de páginas
prevPage: Página anterior
nextPage: Página siguiente
page: Página actual
hasPrevPage: Indicador para saber si la página previa existe
hasNextPage: Indicador para saber si la página siguiente existe.
prevLink: Link directo a la página previa (null si hasPrevPage=false)
nextLink: Link directo a la página siguiente (null si hasNextPage=false)
}

se puede hacer, por ejemplo, de la siguiente forma => http://localhost:8080/api/products?limit=10&page=2&sort=asc&category=deportes

en donde en este ejemplo se mostrarían los productos de la pagina 2, de forma ascendente, de la categoria deportes.

Al ingresar a la pestaña carts se puede ver los detalles de cada carts y se llama a la funcion getCartsWithProducts que utiliza un populate para poblar los detalles de cada carrito, con sus datos completos.

----

Espero que estas aclaraciones y la explicacion pueda ayudar a entender el proyecto para que sea una correción mas fácil y ágil. 

Muchas gracias!

## Créditos

Proyecto desarrollado por Facundo Robert como parte de curso de 'Programación Backend I: Desarrollo Avanzado de Backend'.

