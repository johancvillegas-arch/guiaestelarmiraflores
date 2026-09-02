# Mapa Turístico de Miraflores y Centro de Lima · Eco Estelar

Una guía interactiva y sostenible para explorar los mejores lugares turísticos, restaurantes, tiendas y atracciones del Hotel Estelar Miraflores y el Centro Histórico de Lima.

## 🌟 Características

- **Mapa Interactivo**: Exploración visual con Leaflet.js
- **Múltiples Zonas**: Miraflores, Centro Histórico y Tours por Lima
- **Búsqueda Avanzada**: Encuentra lugares por nombre o categoría
- **Categorización**: Restaurantes, cafés, compras, parques, cultura y más
- **Modo Sostenible (EcoEstelar)**: Destacamos opciones eco-friendly
- **Panel de Detalle**: Información completa de cada lugar (horarios, calificación, tips)
- **Interfaz Multiidioma**: Soporte para español e inglés
- **Progressive Web App**: Funciona offline como aplicación
- **Diseño Responsive**: Optimizado para dispositivos móviles

## 📁 Estructura del Proyecto

```
guia-estelar/
├── index.html              # Página principal
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker para offline
├── README.md               # Este archivo
│
├── css/
│   └── style.css           # Estilos principales
│
├── js/
│   └── app.js              # Lógica de la aplicación
│
├── data/
│   └── places.json         # Base de datos de lugares
│
├── lib/
│   ├── leaflet.js          # Librería de mapas
│   ├── leaflet.css         # Estilos de Leaflet
│   └── images/             # Recursos de Leaflet
│
├── icons/
│   └── custom/
│       └── isotipo-estelar.png  # Logo del proyecto
│
└── img/
    ├── centro/             # Imágenes del Centro de Lima
    └── tours/              # Imágenes de tours
```

## 🚀 Instalación y Uso

### Requisitos
- Un navegador web moderno con soporte para:
  - Leaflet.js
  - Service Workers (para funcionalidad offline)
  - LocalStorage

### Pasos

1. **Clonar o descargar el proyecto**
   ```bash
   git clone https://github.com/tu-usuario/guia-estelar.git
   cd guia-estelar
   ```

2. **Servir localmente** (opcional pero recomendado para PWA)
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   ```

3. **Acceder en el navegador**
   - Localmente: `http://localhost:8000`
   - O simplemente abrir `index.html` en el navegador

4. **Instalar como PWA**
   - En navegadores compatibles, verás una opción "Instalar"
   - En móviles iOS: Usa "Agregar a pantalla de inicio"
   - En móviles Android: Usa "Instalar app"

## 📊 Estructura de Datos (places.json)

Cada lugar contiene:
- `id`: Identificador único
- `name`: Nombre del lugar
- `category`: Categoría (restaurantes, cafés, compras, parques, etc.)
- `lat`/`lng`: Coordenadas GPS
- `address`: Dirección
- `hours`: Horarios de atención
- `rating`: Calificación (0-5)
- `description`: Descripción detallada
- `tip`: Consejo o información práctica
- `image`: (Opcional) URL de imagen

### Categorías Disponibles

| ID | Nombre | Emoji | Color |
|---|---|---|---|
| estelar | Nuestros Hoteles | ⭐ | #0F2447 |
| restaurantes | Restaurantes | 🍽️ | #c0392b |
| cafes | Cafés | ☕ | #7B4F2E |
| compras | Compras | 🛍️ | #8e44ad |
| parques | Parques | 🌳 | #27ae60 |
| ecoestelar | EcoEstelar | 🌿 | #2d6a4f |
| bancos | Bancos / ATM | 💰 | #2471a3 |
| supermercados | Supermercados | 🛒 | #d35400 |
| turismo | Turismo | 🧭 | #16a085 |
| gastronomia | Gastronomía | 🍜 | #c0392b |
| cultura | Cultura | 🎭 | #8e44ad |
| mercados | Mercados | 🏪 | #e67e22 |
| hospitales | Hospitales | 🏥 | #2980b9 |
| tours | Tours Lima | 🎫 | #7d3c98 |

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive y animaciones
- **JavaScript Vanilla**: Sin dependencias externas
- **Leaflet.js**: Librería de mapas interactivos
- **PWA**: Service Workers para funcionalidad offline
- **LocalStorage**: Persistencia de datos del usuario

## 🌍 Cobertura Geográfica

- **Miraflores**: Hoteles, restaurantes, tiendas y atracciones turísticas
- **Centro Histórico**: Museos, iglesias, plazas y patrimonio
- **Tours Lima**: Rutas y experiencias guiadas por la ciudad

## ♿ Accesibilidad

- ARIA labels para navegación por teclado
- Contraste de colores accesible
- Textos alternativos en imágenes
- Soporta lectores de pantalla

## 🌱 Sostenibilidad

La sección **EcoEstelar** destaca:
- Restaurantes con opciones orgánicas
- Comercios eco-friendly
- Parques y espacios verdes
- Iniciativas de turismo responsable

## 📱 Modo Offline

Una vez instalada como PWA:
1. El Service Worker cachea recursos
2. Los datos de lugares se guardan en LocalStorage
3. Funciona sin conexión a internet
4. Se sincroniza cuando hay conexión

## 🔍 Búsqueda y Filtros

- **Búsqueda por nombre**: Encuentra lugares escribiendo
- **Filtro por categoría**: Navega mediante pestañas de zona y categorías
- **Selector de zona**: Miraflores, Centro, Tours
- **Resultados en tiempo real**: Actualizaciones instantáneas

## 📞 Información de Contacto

**Hotel Estelar Miraflores**
- Dirección: Av. Petit Thouars 5444, Miraflores, Lima
- Teléfono: +51 1 611 9000
- Coordenadas: -12.124328, -77.029157

## 🎨 Personalización

### Cambiar colores
Edita el archivo `css/style.css` y busca las variables CSS de colores de categorías.

### Agregar nuevos lugares
1. Abre `data/places.json`
2. Agrega un nuevo objeto con la estructura indicada
3. Los cambios aparecerán automáticamente en el mapa

### Cambiar el idioma
Modifica las cadenas en `js/app.js` y agrega soporte para más idiomas.

## 📄 Licencia

Proyecto desarrollado para Hotel Estelar Miraflores. Todos los derechos reservados.

## 🤝 Contribuciones

Para mejoras o reportar errores:
1. Verifica que el error exista en la versión más reciente
2. Proporciona detalles específicos del problema
3. Sugiere mejoras documentadas

## 📝 Changelog

### v1.0.0 (Actual)
- ✅ Mapa interactivo con Leaflet
- ✅ Búsqueda y filtrado de lugares
- ✅ PWA con soporte offline
- ✅ Panel de detalle con información completa
- ✅ Soporte multiidioma (ES/EN)
- ✅ Categorización de lugares
- ✅ Interfaz responsive

---

**Desarrollado con ❤️ para una experiencia turística sostenible**
