-- Importacion academica al entorno de pruebas de Ferreteria Los Maestros
-- Fuente: Los-Clavitos/src/data/productos.json (85 productos / 9 categorias).
-- Solo INSERT, no UPDATE/DELETE: no cambia las unidades, precios o pedidos existentes.
-- Ejecutar exclusivamente en ferreteria_catalogo_test.

BEGIN;
DO $guard$
BEGIN
  IF current_database() <> 'ferreteria_catalogo_test' THEN
    RAISE EXCEPTION 'SEGURIDAD: prohibido importar fuera de ferreteria_catalogo_test (actual: %)', current_database();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.producto WHERE codigo = 'TEST-001') THEN
    RAISE EXCEPTION 'SEGURIDAD: no se encontro TEST-001 en la base de pruebas; importacion abortada';
  END IF;
END
$guard$;

-- Crear categorias faltantes (se conserva la categoria Materiales de prueba).
INSERT INTO public.categoria (nombre, descripcion) VALUES
  ('Electricidad', 'Categoría del catálogo académico original'),
  ('Gasfitería', 'Categoría del catálogo académico original'),
  ('Herramientas', 'Categoría del catálogo académico original'),
  ('Jardín', 'Categoría del catálogo académico original'),
  ('Madera', 'Categoría del catálogo académico original'),
  ('Mat. Construcción', 'Categoría del catálogo académico original'),
  ('Pinturas', 'Categoría del catálogo académico original'),
  ('Seguridad', 'Categoría del catálogo académico original'),
  ('Tornillería', 'Categoría del catálogo académico original')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar productos nuevos por codigo, preservando los ya existentes.
WITH fuente (codigo,categoria,nombre,descripcion,precio,stock_actual,stock_minimo) AS (
  VALUES
    ('MC001', 'Mat. Construcción', 'Cemento Polpaico gris 25 KG', 'Marca: Polpaico | Subcategoría: Cementos | Unidad: Saco', 5990, 80, 20),
    ('MC002', 'Mat. Construcción', 'Cemento Melón blanco 25 KG', 'Marca: Melón | Subcategoría: Cementos | Unidad: Saco', 7490, 40, 10),
    ('MC003', 'Mat. Construcción', 'Mortero cola cerámica 25 KG', 'Marca: Volcán | Subcategoría: Morteros | Unidad: Saco', 5200, 50, 15),
    ('MC004', 'Mat. Construcción', 'Mortero nivelador piso 25 KG', 'Marca: Weber | Subcategoría: Morteros | Unidad: Saco', 6490, 30, 10),
    ('MC005', 'Mat. Construcción', 'Arena fina construcción 25 KG', 'Marca: Granel | Subcategoría: Áridos | Unidad: Saco', 1800, 60, 20),
    ('MC006', 'Mat. Construcción', 'Ripio 25 KG', 'Marca: Granel | Subcategoría: Áridos | Unidad: Saco', 1500, 60, 20),
    ('MC007', 'Mat. Construcción', 'Ladrillo fiscal N°5', 'Marca: Local | Subcategoría: Ladrillos | Unidad: Unidad', 380, 500, 100),
    ('MC008', 'Mat. Construcción', 'Ladrillo prensado 6x14x29 cm', 'Marca: Melón | Subcategoría: Ladrillos | Unidad: Unidad', 550, 300, 80),
    ('MC009', 'Mat. Construcción', 'Bloque de hormigón 19x19x39 cm', 'Marca: Volcán | Subcategoría: Bloques | Unidad: Unidad', 1200, 200, 50),
    ('MC010', 'Mat. Construcción', 'Bloque liviano 10x20x40 cm', 'Marca: Ytong | Subcategoría: Bloques | Unidad: Unidad', 1690, 100, 30),
    ('PT001', 'Pinturas', 'Pintura látex interior 1 galón blanco', 'Marca: Sipa | Subcategoría: Látex | Unidad: Galón', 9990, 40, 10),
    ('PT002', 'Pinturas', 'Pintura látex interior 4 litros (varios col.)', 'Marca: Sipa | Subcategoría: Látex | Unidad: Envase 4L', 12990, 30, 8),
    ('PT003', 'Pinturas', 'Pintura látex exterior 1 galón blanco', 'Marca: Kömex | Subcategoría: Látex | Unidad: Galón', 13990, 25, 8),
    ('PT004', 'Pinturas', 'Esmalte sintético 1/4 litro (varios col.)', 'Marca: Sipa | Subcategoría: Esmalte | Unidad: 1/4 L', 4290, 50, 15),
    ('PT005', 'Pinturas', 'Esmalte sintético 1 litro (varios col.)', 'Marca: Sipa | Subcategoría: Esmalte | Unidad: 1 litro', 9490, 30, 10),
    ('PT006', 'Pinturas', 'Pintura antihumedad 1 galón blanco', 'Marca: Kömex | Subcategoría: Antihumedad | Unidad: Galón', 17990, 15, 5),
    ('PT007', 'Pinturas', 'Rodillo lana 23 cm con mango', 'Marca: Wurth | Subcategoría: Accesorios | Unidad: Unidad', 3990, 30, 10),
    ('PT008', 'Pinturas', 'Brocha cerda natural 3"', 'Marca: Sipa | Subcategoría: Accesorios | Unidad: Unidad', 1690, 40, 10),
    ('PT009', 'Pinturas', 'Cinta de enmascarar 24mm x 50m', 'Marca: 3M | Subcategoría: Accesorios | Unidad: Rollo', 2490, 60, 20),
    ('HM001', 'Herramientas', 'Martillo carpintero 500g', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 7990, 20, 5),
    ('HM002', 'Herramientas', 'Alicate universal 8"', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 7290, 15, 5),
    ('HM003', 'Herramientas', 'Destornillador plano 6x100mm', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 1990, 30, 10),
    ('HM004', 'Herramientas', 'Destornillador Phillips PH2 6x100mm', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 1990, 30, 10),
    ('HM005', 'Herramientas', 'Llave ajustable 10"', 'Marca: Bahco | Subcategoría: Manuales | Unidad: Unidad', 8490, 12, 4),
    ('HM006', 'Herramientas', 'Juego llaves hexagonales métrico x9', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Set', 5490, 15, 5),
    ('HM007', 'Herramientas', 'Serrucho 20" 7 dientes por pulgada', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 9490, 10, 3),
    ('HM008', 'Herramientas', 'Nivel de burbuja 60 cm', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 10490, 8, 3),
    ('HM009', 'Herramientas', 'Metro de tela 5m', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 4290, 25, 8),
    ('HM010', 'Herramientas', 'Cinta métrica 8m autoblocante', 'Marca: Stanley | Subcategoría: Manuales | Unidad: Unidad', 6490, 20, 6),
    ('HE001', 'Herramientas', 'Taladro percutor 650W 13mm', 'Marca: Makita | Subcategoría: Eléctricas | Unidad: Unidad', 79990, 8, 2),
    ('HE002', 'Herramientas', 'Atornillador inalámbrico 12V (kit)', 'Marca: Makita | Subcategoría: Eléctricas | Unidad: Unidad', 104990, 5, 2),
    ('HE003', 'Herramientas', 'Amoladora angular 4.5" 800W', 'Marca: Makita | Subcategoría: Eléctricas | Unidad: Unidad', 54990, 8, 2),
    ('HE004', 'Herramientas', 'Sierra circular 7-1/4" 1200W', 'Marca: Skil | Subcategoría: Eléctricas | Unidad: Unidad', 72990, 4, 1),
    ('HE005', 'Herramientas', 'Lijadora orbital 180W', 'Marca: Black+Decker | Subcategoría: Eléctricas | Unidad: Unidad', 34990, 6, 2),
    ('HE006', 'Herramientas', 'Caladora 500W', 'Marca: Skil | Subcategoría: Eléctricas | Unidad: Unidad', 42990, 4, 1),
    ('GS001', 'Gasfitería', 'Cañería PVC 1/2" x 6m', 'Marca: Tigre | Subcategoría: Tuberías | Unidad: Unidad', 5490, 30, 10),
    ('GS002', 'Gasfitería', 'Cañería PVC 3/4" x 6m', 'Marca: Tigre | Subcategoría: Tuberías | Unidad: Unidad', 7490, 25, 8),
    ('GS003', 'Gasfitería', 'Cañería cobre 1/2" x 5m', 'Marca: Codelco | Subcategoría: Tuberías | Unidad: Unidad', 17990, 15, 5),
    ('GS004', 'Gasfitería', 'Codo PVC 1/2" 90°', 'Marca: Tigre | Subcategoría: Uniones | Unidad: Unidad', 390, 100, 30),
    ('GS005', 'Gasfitería', 'Te PVC 1/2"', 'Marca: Tigre | Subcategoría: Uniones | Unidad: Unidad', 450, 80, 25),
    ('GS006', 'Gasfitería', 'Unión doble PVC 1/2"', 'Marca: Tigre | Subcategoría: Uniones | Unidad: Unidad', 320, 80, 25),
    ('GS007', 'Gasfitería', 'Llave de paso esfera 1/2" latón', 'Marca: Emmeti | Subcategoría: Llaves | Unidad: Unidad', 3490, 30, 10),
    ('GS008', 'Gasfitería', 'Llave de paso esfera 3/4" latón', 'Marca: Emmeti | Subcategoría: Llaves | Unidad: Unidad', 4990, 20, 8),
    ('GS009', 'Gasfitería', 'Grifería lavamanos monocomando cromo', 'Marca: Corona | Subcategoría: Grifería | Unidad: Unidad', 22990, 10, 3),
    ('GS010', 'Gasfitería', 'Grifería cocina monocomando cuello alto', 'Marca: Corona | Subcategoría: Grifería | Unidad: Unidad', 28990, 8, 2),
    ('GS011', 'Gasfitería', 'Teflón 3/4" x 12m', 'Marca: 3M | Subcategoría: Sellos | Unidad: Rollo', 790, 80, 25),
    ('GS012', 'Gasfitería', 'Silicona transparente 280ml', 'Marca: Wacker | Subcategoría: Sellos | Unidad: Cartucho', 5490, 25, 8),
    ('EL001', 'Electricidad', 'Cable unipolar 1.5mm² (por metro)', 'Marca: Condulac | Subcategoría: Conductores | Unidad: Metro', 590, 100, 30),
    ('EL002', 'Electricidad', 'Cable unipolar 2.5mm² (por metro)', 'Marca: Condulac | Subcategoría: Conductores | Unidad: Metro', 790, 100, 30),
    ('EL003', 'Electricidad', 'Cable dúplex paralelo 2x1.5mm² (por metro)', 'Marca: Condulac | Subcategoría: Conductores | Unidad: Metro', 990, 80, 25),
    ('EL004', 'Electricidad', 'Enchufe empotrar 16A c/tierra (schuko)', 'Marca: Bticino | Subcategoría: Enchufes | Unidad: Unidad', 3690, 50, 15),
    ('EL005', 'Electricidad', 'Enchufe doble empotrar 16A c/tierra', 'Marca: Bticino | Subcategoría: Enchufes | Unidad: Unidad', 5490, 40, 12),
    ('EL006', 'Electricidad', 'Interruptor simple empotrar', 'Marca: Bticino | Subcategoría: Interruptores | Unidad: Unidad', 3190, 50, 15),
    ('EL007', 'Electricidad', 'Interruptor doble empotrar', 'Marca: Bticino | Subcategoría: Interruptores | Unidad: Unidad', 4290, 35, 10),
    ('EL008', 'Electricidad', 'Tablero eléctrico 4 espacios DIN', 'Marca: Legrand | Subcategoría: Tableros | Unidad: Unidad', 22990, 8, 2),
    ('EL009', 'Electricidad', 'Disyuntor termomagnético 16A unipolar', 'Marca: Schneider | Subcategoría: Tableros | Unidad: Unidad', 6490, 20, 5),
    ('EL010', 'Electricidad', 'Disyuntor termomagnético 25A unipolar', 'Marca: Schneider | Subcategoría: Tableros | Unidad: Unidad', 6990, 20, 5),
    ('EL011', 'Electricidad', 'Ampolleta LED 9W E27 luz fría', 'Marca: Philips | Subcategoría: Iluminación | Unidad: Unidad', 3990, 60, 20),
    ('EL012', 'Electricidad', 'Ampolleta LED 12W E27 luz cálida', 'Marca: Philips | Subcategoría: Iluminación | Unidad: Unidad', 4490, 50, 15),
    ('EL013', 'Electricidad', 'Panel LED empotrar 18W 22cm', 'Marca: Ledvance | Subcategoría: Iluminación | Unidad: Unidad', 11490, 20, 6),
    ('TR001', 'Tornillería', 'Tornillo autoperf. 8x1" caja 100 unid.', 'Marca: Hilti | Subcategoría: Tornillos | Unidad: Caja', 2990, 40, 12),
    ('TR002', 'Tornillería', 'Tornillo madera 4x40mm caja 100 unid.', 'Marca: Hilti | Subcategoría: Tornillos | Unidad: Caja', 2490, 40, 12),
    ('TR003', 'Tornillería', 'Tornillo volcanita 3.5x25mm caja 200 unid.', 'Marca: Hilti | Subcategoría: Tornillos | Unidad: Caja', 3490, 30, 10),
    ('TR004', 'Tornillería', 'Taco fisher S6 bolsa 100 unid.', 'Marca: Fischer | Subcategoría: Tacos | Unidad: Bolsa', 3190, 35, 10),
    ('TR005', 'Tornillería', 'Taco fisher S8 bolsa 50 unid.', 'Marca: Fischer | Subcategoría: Tacos | Unidad: Bolsa', 2890, 30, 10),
    ('TR006', 'Tornillería', 'Perno hex. 3/8" x 2" c/tuerca y golilla', 'Marca: Granel | Subcategoría: Pernos | Unidad: Unidad', 290, 200, 50),
    ('TR007', 'Tornillería', 'Perno de anclaje 10x100mm', 'Marca: Hilti | Subcategoría: Anclajes | Unidad: Unidad', 990, 60, 15),
    ('TR008', 'Tornillería', 'Anclaje químico epoxi 300ml', 'Marca: Fischer | Subcategoría: Anclajes | Unidad: Cartucho', 15990, 8, 2),
    ('MD001', 'Madera', 'Pino cepillado 1x3" x 3m', 'Marca: Local | Subcategoría: Pino cepillado | Unidad: Unidad', 4290, 40, 12),
    ('MD002', 'Madera', 'Pino cepillado 2x4" x 3m', 'Marca: Local | Subcategoría: Pino cepillado | Unidad: Unidad', 7490, 30, 10),
    ('MD003', 'Madera', 'Terciado estructural 18mm 1.22x2.44m', 'Marca: Arauco | Subcategoría: Tableros | Unidad: Plancha', 34990, 20, 5),
    ('MD004', 'Madera', 'MDF 15mm 1.22x2.44m', 'Marca: Arauco | Subcategoría: Tableros | Unidad: Plancha', 27990, 15, 4),
    ('MD005', 'Madera', 'OSB 9mm 1.22x2.44m', 'Marca: Arauco | Subcategoría: Tableros | Unidad: Plancha', 18990, 18, 5),
    ('MD006', 'Madera', 'Volcanita estándar 10mm 1.2x2.4m', 'Marca: Volcán | Subcategoría: Tableros | Unidad: Plancha', 8990, 30, 8),
    ('MD007', 'Madera', 'Volcanita resistente humedad 10mm', 'Marca: Volcán | Subcategoría: Tableros | Unidad: Plancha', 11990, 15, 4),
    ('SE001', 'Seguridad', 'Casco seguridad blanco', 'Marca: 3M | Subcategoría: EPP | Unidad: Unidad', 6990, 15, 5),
    ('SE002', 'Seguridad', 'Guantes de cuero talla L', 'Marca: 3M | Subcategoría: EPP | Unidad: Par', 3690, 20, 6),
    ('SE003', 'Seguridad', 'Antiparras de seguridad clear', 'Marca: 3M | Subcategoría: EPP | Unidad: Unidad', 2490, 25, 8),
    ('SE004', 'Seguridad', 'Mascarilla respirador N95 (caja x10)', 'Marca: 3M | Subcategoría: EPP | Unidad: Caja', 10990, 10, 3),
    ('SE005', 'Seguridad', 'Arnés de seguridad 1 punto', 'Marca: 3M | Subcategoría: EPP | Unidad: Unidad', 34990, 4, 1),
    ('JA001', 'Jardín', 'Manguera riego 3/4" x 25m', 'Marca: Tigre | Subcategoría: Mangueras | Unidad: Unidad', 22990, 6, 2),
    ('JA002', 'Jardín', 'Manguera expandible 30m', 'Marca: Bestway | Subcategoría: Mangueras | Unidad: Unidad', 28990, 5, 2),
    ('JA003', 'Jardín', 'Pistola de riego 8 modos', 'Marca: Bestway | Subcategoría: Mangueras | Unidad: Unidad', 5490, 10, 3),
    ('JA004', 'Jardín', 'Pala punta redonda #2 con mango', 'Marca: Corona | Subcategoría: Herramientas | Unidad: Unidad', 10990, 8, 2),
    ('JA005', 'Jardín', 'Rastrillo 16 dientes con mango', 'Marca: Corona | Subcategoría: Herramientas | Unidad: Unidad', 9490, 6, 2)
)
INSERT INTO public.producto (id_categoria,codigo,nombre,descripcion,precio,stock_actual,stock_minimo,activo)
SELECT c.id_categoria, f.codigo, f.nombre, f.descripcion, f.precio, f.stock_actual, f.stock_minimo, 1
FROM fuente f
JOIN public.categoria c ON c.nombre = f.categoria
ON CONFLICT (codigo) DO NOTHING;

-- Validar el conjunto esperado antes de confirmar la transaccion.
DO $validate$
BEGIN
  IF (SELECT COUNT(*) FROM public.producto WHERE codigo IN (
    'MC001', 'MC002', 'MC003', 'MC004', 'MC005', 'MC006', 'MC007', 'MC008', 'MC009', 'MC010', 'PT001', 'PT002',
    'PT003', 'PT004', 'PT005', 'PT006', 'PT007', 'PT008', 'PT009', 'HM001', 'HM002', 'HM003', 'HM004', 'HM005',
    'HM006', 'HM007', 'HM008', 'HM009', 'HM010', 'HE001', 'HE002', 'HE003', 'HE004', 'HE005', 'HE006', 'GS001',
    'GS002', 'GS003', 'GS004', 'GS005', 'GS006', 'GS007', 'GS008', 'GS009', 'GS010', 'GS011', 'GS012', 'EL001',
    'EL002', 'EL003', 'EL004', 'EL005', 'EL006', 'EL007', 'EL008', 'EL009', 'EL010', 'EL011', 'EL012', 'EL013',
    'TR001', 'TR002', 'TR003', 'TR004', 'TR005', 'TR006', 'TR007', 'TR008', 'MD001', 'MD002', 'MD003', 'MD004',
    'MD005', 'MD006', 'MD007', 'SE001', 'SE002', 'SE003', 'SE004', 'SE005', 'JA001', 'JA002', 'JA003', 'JA004',
    'JA005'
  )) <> 85 THEN
    RAISE EXCEPTION 'No quedaron cargados los 85 codigos originales. ROLLBACK';
  END IF;
END
$validate$;
COMMIT;

-- Comprobaciones (solo lectura).
SELECT current_database() AS base, COUNT(*) AS productos_totales, COUNT(*) FILTER (WHERE activo=1) AS productos_activos FROM public.producto;
SELECT c.nombre AS categoria, COUNT(p.id_producto) AS productos FROM public.categoria c LEFT JOIN public.producto p ON p.id_categoria=c.id_categoria GROUP BY c.nombre ORDER BY c.nombre;
SELECT codigo,nombre,precio,stock_actual FROM public.producto WHERE codigo IN ('MC001','MC002','JA005','TEST-001') ORDER BY codigo;
