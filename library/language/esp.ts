import { register } from "module";
import { notFound } from "next/navigation";

export const esp = {
    nav: {
        hamburguer: {
            top: 'Cuenta Activa',
            editProfile: 'Editar Perfil',
            friends: 'Amigos',
            closeSection: 'Cerrar Sesión'
        },
        auth:
        {
            login: 'Iniciar Sesión',
            signup: 'Crear Cuenta'
        }
    },
    home: {
        top: 'Tus Accesos Directos',
        title: '¿Qué vamos a ver hoy?',
        interest: 'Intereses'
    },
    recipes: {
        top: 'Mis recetas',
        subtitle: 'Gestiona tus creaciones personales',
        recipes: 'Recetas',
        myRecipes: 'Mis Recetas',
        author: 'Autor de la receta',
        interest: 'Intereses',
        edit: 'Editar Receta',
        add: '+ Agregar Receta',
        save: '¡Receta guardada con éxito!',
        found: 'Recetas encontradas',
        explore: 'Explorar Recetas',
        mustLogin: 'Debes estar logueado para añadir recetas',
        errorExist: '¡Ups! Ya existe una receta con este título. Por favor, intenta con uno diferente.',
        description: 'Gestiona tus creaciones personales',
        noRecipe: 'No se encontraron recetas. ¡Comienza agregando tu primera obra maestra!',
        noFound: 'Receta no encontrada',
        noFoundmessage: 'Lo sentimos, la receta que buscas no existe o ha sido marcada como privada por su autor.\n\n¡Pero no te quedes con hambre! Puedes explorar otras creaciones.',
        allRecipes: 'Todas mis recetas',
        niceMessage: 'Buen provecho. Cocinado con ❤️ en tu Recipe Book.',
        filter:
        {
            title: 'Filtros de búsqueda',
            name: 'Nombre',
            tag: 'Etiqueta / Cocina',
            search: 'Buscar ahora',
            clean: 'Limpiar filtros',
        },
        create:
        {
            title: 'Agregar Nueva Receta',
            description: 'Crea tus creaciones personales',
            titleNoAvailable: 'Título no disponible',
            save: 'Guardar Receta'
        },
        updated:
        {
            title: 'Editar Receta',
            success: '¡Receta actualizada!'
        },
        placeholder:
        {
            name: 'Ej: Tacos al Pastor',
            tags: 'Ej: Mexicana, Italiana...',
            ingredients: 'Enumera los ingredientes...',
            instructions: 'Paso a paso para preparar la receta...'
        }

    },
    restaurants:
    {
        restaurants: 'Restaurantes',
        description: 'Encuentra tu próximo lugar favorito',
        add: '+ Agregar Restaurante',
        seeAll: 'Ver todos los restaurantes',
        notFound: 'Restaurante no encontrada',
        notFoundmessage: 'Lo sentimos, El restaurant que buscas no existe o ha sido marcada como privada por su autor.\n\n¡Pero no te quedes con hambre! Puedes explorar otras creaciones.',
        myRestaurants: 'Mis Restaurantes',
        edit: 'Editar Restaurante',
        editing: 'Editando',
        update: 'Actualizar Restaurante',
        create: 'Crear Restaurante',
        nameRestaurant: 'Nombre del Restaurante',
        kind: 'Tipo de Cocina',
        createdSuccess: '¡Restaurante creado con éxito!',
        register: 'Registrar Restaurante',
        addNew: 'Agregar Nuevo Restaurante',
        filter:
        {
            tag: 'Etiqueta / Cocina'
        },
        placeholder:
        {
            name: 'Ej: La Pizzería...',
            tag: 'Ej: Vegano, Sushi...',
        }
    },
    friends: {
        myFriends: 'Mis Amigos',
        notFriends: 'Aún no tienes amigos agregados',
        conections: 'conexiones confirmadas',
        findFriends: 'Busca a otros amigos para conectar.',
        noBiography: 'Sin biografía todavía',
        addFriend: 'Agregar Amigo',
        friends: 'Amigos',
        pendingRequest: 'Solicitud Pendiente',
        requests: 'Solicitudes',
        noPendingRequests: 'No tienes solicitudes pendientes.',
        friendshipConfirmed: '¡Nueva amistad confirmada!',
        unfriend: 'Quitar Amigo',
        unfriendConfirm: '¿Seguro que quieres quitar a @{{name}} de tus amigos?',
        unfriendError: 'Error al quitar amigo'
    },
    albums: {
        albums: 'Álbumes',
        myAlbums: 'Mis Álbumes',
        add: '+ Agregar Álbum',
        description: 'Tu colección de recuerdos en fotos',
        noAlbums: 'Aún no tienes álbumes. ¡Empieza compartiendo tus fotos favoritas!',
        notFound: 'Álbum no encontrado',
        notFoundMessage: 'Lo sentimos, el álbum que buscas no existe o es privado.',
        saved: '¡Álbum creado con éxito!',
        errorExist: '¡Ups! Ya existe un álbum con este título. Intenta con uno diferente.',
        noPhotos: 'Este álbum aún no tiene fotos',
        photos: 'fotos',
        allAlbums: 'Todos los álbumes',
        found: 'álbumes encontrados',
        create: {
            title: 'Crear Nuevo Álbum',
            description: 'Comparte tus mejores momentos en fotos',
            save: 'Guardar Álbum',
            titleNoAvailable: 'Título no disponible',
        },
        updated: {
            title: 'Editar Álbum',
            success: '¡Álbum actualizado!',
        },
        filter: {
            title: 'Filtros de búsqueda',
            name: 'Título del álbum',
            tag: 'Etiqueta',
            search: 'Buscar ahora',
            clean: 'Limpiar filtros',
        },
        placeholder: {
            name: 'Ej: Vacaciones 2024...',
            tags: 'Ej: viaje, familia...',
            description: 'Cuéntanos sobre este álbum...',
        },
    },
    footer: {
        rights: 'Todos los derechos reservados',
        contact: 'Contáctanos'
    },
    global: {
        notLoggedIn: 'Debes iniciar sesión',
        delete: 'Delete',
        edit: 'Editar',
        deleteError: 'Error al eliminar:',
        deleteConfirm: '¿Estás seguro de que quieres borrar?',
        errorSave: 'Error guardando',
        noFound: 'No hay resultados para esta búsqueda...',
        saving: 'Guardando...',
        loading: 'Cargando...',
        editing: 'Editando',
        update: 'Actualizar',
        noVotes: 'Sin votos',
        description: 'Descripción',
        notDescripton: 'No hay una descripción detallada disponible.',
        ingredients: 'Ingredientes',
        instructions: 'Instrucciones',
        back: 'Volver',
        searchFriend: 'Buscar chefs o amigos...',
        searchNow: 'Buscar Ahora',
        filter: 'Filtros de búsqueda',
        explore: 'Explorar',
        aboutUs: 'Sobre nosotros',
        location: 'Ubicación',
        mapInteractiveSoon: '',
        contact: 'Contacto',
        websiteOfficial: 'Sitio Web Oficial',
        hours: 'Horarios',
        closed: 'Cerrado',
        notPermitions: 'No encontrado o sin permisos',
        errorUpdate: 'Error al actualizar',
        generalInformation: 'Información General',
        contactWeb: 'Contacto y Web',
        attentionHours: 'Horarios de Atención',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        deleteAction: 'Sí, eliminar',
        deleteWarning: 'Esta acción no se puede deshacer.'
    },
    week:
    {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miercoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo'
    },
    form:
    {
        name: 'Nombre',
        tags: 'Etiquetas',
        privacity:
        {
            public: '🔓 Publico (Todos pueden ver)',
            friends: '👥 Amigos (Solo seguidores)',
            private: '🔒 Privado (Solo yo)'
        },
        servings: 'Raciones',
        duration: 'Duracion',
        descriptionShort: 'Descripción Corta',
        descriptionLong: 'Descripción Detallada',
        ingredients: 'Ingredientes (agrega Enter por Ingrediente)',
        instructions: 'Instrucciones (agrega Enter por Paso)',
        city: 'Ciudad',
        state: 'Estado',
        address: 'DIRECCIÓN / ZONA',
        price: 'Precio',
        priceRange: 'Rango de Precios',
        latitude: 'Latitud',
        longitude: 'Longitud',
        phone: 'Teléfono',
        website: 'Sitio Web',
        imageRecipe: 'Imagen de la receta',
        imageRestaurant: 'Imagen del restaurante',
        imageProfile: 'Foto de perfil',
        uploadImage: 'Subir imagen',
        changeImage: 'Cambiar imagen',
        removeImage: 'Quitar imagen',
        imageFormats: 'JPG, PNG o WEBP · máx 10 MB',
        imageGallery: 'Galería de fotos',
        addPhoto: 'Agregar foto',
        photos: 'fotos',
        photosUploaded: 'foto(s) subida(s)',
        imageMaxSize: 'excede el límite de 10 MB',
        uploadError: 'Error al subir',
    },
    placeholder:
    {
        duration: 'Tiempo en minutos',
        descriptionShort: 'Resumen rápido (una frase)',
        descriptionLong: 'Cuéntanos más ...',
        city: 'Ej: Morelia',
        state: 'Ej: Michoacán',
        address: 'Calle, Número o colonia...',
        price: 'Cualquier precio',
        latitude: 'Latitud',
        longitude: 'Longitud',
        phone: 'Teléfono',
        website: 'Sitio Web (https://...)'
    }
};