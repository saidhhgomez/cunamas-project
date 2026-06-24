INSERT INTO categoria_alimento (nombre_categoria_alimento)
VALUES
('LÁCTEOS'),
('PRODUCTOS DE ORIGEN ANIMAL'),
('HUEVO'),
('OVOPRODUCTO'),
('LEGUMINOSAS Y DERIVADOS'),
('RAÍCES Y TUBÉRCULOS (DERIVADOS)'),
('CEREALES Y DERIVADOS'),
('ACEITES, GRASAS Y OLEAGINOSAS'),
('VERDURAS Y HORTALIZAS'),
('FRUTAS (DERIVADOS)'),
('ALIMENTO INFANTIL'),
('AGUA'),
('POTENCIADORES DEL SABOR'),
('GRANOS'),
('GALLETA'),
('PRODUCTOS AZUCARADOS');

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 1, 'Mazamorras (leche evaporada)', 1),
(1, 1, 'Mazamorras (leche UHT)', 1),
(1, 1, 'Otros (leche evaporada en chupes, cremas u otros)', 1),
(1, 1, 'Otros (Leche UHT en chupes, cremas u otros)', 1),
(1, 1, 'Otros (Queso madurado en chupes, cremas u otros)', 1); 

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 2, 'Segundos con leguminosas (carnes y vísceras)', 1),
(1, 2, 'Segundos guisos (sangrecita y bazo)', 1),
(1, 2, 'Segundos (todas las carnes y vísceras para combinar, menos sangrecita ni bazo)', 1),
(1, 2, 'Segundos (sangresita y bazo para combinar con otras carnes y visceras)', 1),
(1, 2, 'Mazamorras (visceras)', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 3, 'Segundos (entero) con leguminosas', 0.88),
(1, 3, 'Papillas (yema de huevo)', 1),
(1, 3, 'Ligante', 0.88);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 4, 'Mezcla en polvo a base de huevo', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 5, 'Segundos (guisos, papillas)', 1),
(1, 5, 'Segundos con tubérculos (guisos, papillas)', 1),
(1, 5, 'Mazamorras, harinas (sin espesante)', 1),
(1, 5, 'Mazamorras, con 2 harinas u hojuelas (dosificación por cada una), sin espesante', 1),
(1, 5, 'Mazamorras, harinas (que van a usar espesante)', 1),
(1, 5, 'Mazamorras, harina como espesante', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 6, 'Saltados', 0.85),
(1, 6, 'Purés, papillas o guisos (papa, camote, yuca)', 0.85),
(1, 6, 'Purés, papillas o guisos (olluco, oca, etc.)', 0.95),
(1, 6, 'Guisos (papa seca)', 1),
(1, 6, 'Segundos con leguminosas, en guisos de quinua o trigo, en guisos, como guarnición (papa, camote,yuca)', 0.85),
(1, 6, 'Segundos con leguminosas, en guisos de quinua o trigo, en guisos, como guarnición (olluco, oca, etc.)', 0.95),
(1, 6, 'Batidos', 0.85),
(1, 6, 'Mazamorras (enteros)', 0.85),
(1, 6, 'Mazamorras, harinas (sin espesante)', 1),
(1, 6, 'Mazamorras, con 2 harinas (dosificación por cada una), sin espesante', 1),
(1, 6, 'Mazamorras, harinas (que van a usar espesante)', 1),
(1, 6, 'Mazamorras, harina como espesante', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 7, 'Segundos (arroz como guarnición)', 1),
(1, 7, 'Arroz (chaufa, jardinera y arroz verde)', 1),
(1, 7, 'Fideos (como guarnición)', 1),
(1, 7, 'Fideos (como plato principal)', 1),
(1, 7, 'Segundos (quinua y trigo como guarnición, papillas)', 1),
(1, 7, 'Segundos (quinua y trigo como plato principal)', 1),
(1, 7, 'Mazamorras (harinas, hojuelas, arroz, trigo) sin espesante', 1),
(1, 7, 'Mazamorras, con 2 harinas u hojuelas o enteros (dosificación por cada una), sin espesante', 1),
(1, 7, 'Mazamorras, harinas u hojuelas o enteros (que van a usar espesante)', 1),
(1, 7, 'Batidos', 1),
(1, 7, 'Mazamorras, harina u hojuelas como espesante Para apanar, ligante', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 8, 'Arroz con guisos, púres o leguminosas', 1),
(1, 8, 'Adicional para Frituras', 1),
(1, 8, 'Papillas o puré', 1),
(1, 8, 'Adicional (1 cucharadita)', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 9, 'Zapallo (locro, papillas)', 0.85),
(1, 9, 'Zapallo, calabaza, zanahorias (mazamorras)', 0.85),
(1, 9, 'Limón (ensaladas cocidas)', 0.48),
(1, 9, 'Vainitas, beterraga, zanahoria, espinacas (como ingredientes principales de guiso, ensaladas cocidas, salsa para tallarines)', 0.85),
(1, 9, 'Choclo (como ingrediente principal en papillas, guisos y ensaladas)', 0.6),
(1, 9, 'Choclo (pepián)', 0.6),
(1, 9, 'Cebolla y tomate, zanahoria, pimiento, zapallo (aderezos y otros)', 0.9),
(1, 9, 'Cebolla y tomate (encebollados, escabeche, saltados, salsa para tallarines)', 0.9),
(1, 9, 'Tomate (entomatados, salsa para tallarines)', 0.9),
(1, 9, 'Ajos', 0.9),
(1, 9, 'Arveja, choclo, (Guisos). Albahaca (Salsa para Tallarines)', 0.5),
(1, 9, 'Zanahoria, pimiento, zapallo loche, nabo (Guisos, papillas)', 0.85),
(1, 9, 'Zanahoria, pimiento, zapallo macre, espinaca (aderezos)', 0.85),
(1, 9, 'Espinaca, apio, nabo, acelga (guisos y papillas)', 0.8),
(1, 9, 'Culantro, perejil, albahaca, sacha culantro (aderezos)', 0.6),
(1, 9, 'Paprika fresca, kion', 0.9),
(1, 9, 'Hierbas aromáticas', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 10, 'Como complemento (aguaymanto, fresa, lúcuma, mandarina, mango, manzana, melocotón, melón, papaya, pera, plátano, uva)', 0.85),
(1, 10, 'Como complemento (granadilla, piña, sandia, tuna, naranja)', 0.5),
(1, 10, 'En mazamorras o batidos (aguaymanto, fresa, lúcuma, mandarina, mango, manzana, membrillo, carambola, melocotón, melón, papaya, pera, plátano, uva)', 0.85),
(1, 10, 'En mazamorras o batidos (granadilla, maracuyá, piña, sandía, tuna, naranja, cocona)', 0.5),
(1, 10, 'Plátano verde (papillas)', 0.85),
(1, 10, 'Mazamorras, harinas (sin espesante)', 1),
(1, 10, 'Mazamorras, con 2 harinas u hojuelas (dosificación por cada una), sin espesante', 1),
(1, 10, 'Mazamorras, harinas (que van usar espesante)', 1),
(1, 10, 'Mazamorras, harina como espesante', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 11, 'Como mazamorra o papilla (preparación instantánea)', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 12, 'Mazamorras con leche evaporada', 1),
(1, 12, 'Mazamorras con leche UHT', 1),
(1, 12, 'Mazamorras sin leche', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 13, 'Especias', 1),
(1, 13, 'Sal por cada preparación', 1),
(1, 13, 'Sal total en el día', 1),
(1, 13, 'Vinagre', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 14, 'Ajonjolí', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 15, 'Espesante en segundos, papilla', 1),
(1, 15, 'Ración (en casos de emergencia)', 1);

INSERT INTO tipo_preparacion
(id_persona, id_categoria_alimento, nombre_preparacion, porcion_comestible)
VALUES
(1, 16, 'Azúcar o panela total en el día', 1),
(1, 16, 'Algarrobina', 1);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(1,1,50),
(1,2,50),
(1,3,60),
(1,4,60),
(1,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(2,1,100),
(2,2,100),
(2,3,120),
(2,4,120),
(2,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(3,1,10),
(3,2,10),
(3,3,20),
(3,4,20),
(3,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(4,1,20),
(4,2,20),
(4,3,40),
(4,4,40),
(4,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(5,1,5),
(5,2,5),
(5,3,7),
(5,4,7),
(5,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(6,1,50),
(6,2,50),
(6,3,50),
(6,4,50),
(6,5,50);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(7,1,50),
(7,2,50),
(7,3,50),
(7,4,50),
(7,5,50);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(8,1,30),
(8,2,30),
(8,3,30),
(8,4,30),
(8,5,30);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(9,1,20),
(9,2,20),
(9,3,20),
(9,4,20),
(9,5,20);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(10,1,10),
(10,2,10),
(10,3,10),
(10,4,10),
(10,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(11,1,60),
(11,2,60),
(11,3,60),
(11,4,60),
(11,5,60);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(12,1,20),
(12,2,20),
(12,3,0),
(12,4,0),
(12,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(13,1,0),
(13,2,6),
(13,3,6),
(13,4,6),
(13,5,6);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(14,1,10),
(14,2,10),
(14,3,10),
(14,4,15),
(14,5,15);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(15,1,20),
(15,2,20),
(15,3,25),
(15,4,35),
(15,5,60);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(16,1,20),
(16,2,20),
(16,3,25),
(16,4,35),
(16,5,60);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(17,1,14),
(17,2,16),
(17,3,22),
(17,4,24),
(17,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(18,1,7),
(18,2,8),
(18,3,11),
(18,4,12),
(18,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(19,1,10),
(19,2,12),
(19,3,17),
(19,4,19),
(19,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(20,1,4),
(20,2,4),
(20,3,5),
(20,4,5),
(20,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(21,1,60),
(21,2,60),
(21,3,70),
(21,4,100),
(21,5,120);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(22,1,50),
(22,2,50),
(22,3,80),
(22,4,80),
(22,5,120);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(23,1,50),
(23,2,50),
(23,3,80),
(23,4,80),
(23,5,100);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(24,1,0),
(24,2,30),
(24,3,35),
(24,4,40),
(24,5,80);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(25,1,30),
(25,2,30),
(25,3,30),
(25,4,50),
(25,5,80);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(26,1,30),
(26,2,30),
(26,3,30),
(26,4,50),
(26,5,80);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(27,1,15),
(27,2,24),
(27,3,30),
(27,4,36),
(27,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(28,1,15),
(28,2,24),
(28,3,30),
(28,4,36),
(28,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(29,1,14),
(29,2,16),
(29,3,22),
(29,4,24),
(29,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(30,1,7),
(30,2,8),
(30,3,11),
(30,4,12),
(30,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(31,1,10),
(31,2,12),
(31,3,17),
(31,4,19),
(31,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(32,1,4),
(32,2,4),
(32,3,5),
(32,4,5),
(32,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(33,1,0),
(33,2,35),
(33,3,50),
(33,4,60),
(33,5,120);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(34,1,0),
(34,2,40),
(34,3,70),
(34,4,80),
(34,5,150);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(35,1,25),
(35,2,25),
(35,3,45),
(35,4,45),
(35,5,100);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(36,1,0),
(36,2,35),
(36,3,60),
(36,4,65),
(36,5,120);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(37,1,10),
(37,2,20),
(37,3,30),
(37,4,30),
(37,5,50);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(38,1,0),
(38,2,20),
(38,3,40),
(38,4,40),
(38,5,80);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(39,1,14),
(39,2,16),
(39,3,22),
(39,4,24),
(39,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(40,1,7),
(40,2,8),
(40,3,11),
(40,4,12),
(40,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(41,1,10),
(41,2,12),
(41,3,17),
(41,4,19),
(41,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(42,1,14),
(42,2,16),
(42,3,22),
(42,4,24),
(42,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(43,1,4),
(43,2,4),
(43,3,5),
(43,4,5),
(43,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(44,1,0),
(44,2,11),
(44,3,15),
(44,4,17),
(44,5,17);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(45,1,0),
(45,2,0),
(45,3,5),
(45,4,8),
(45,5,10);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(46,1,7),
(46,2,0),
(46,3,0),
(46,4,0),
(46,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(47,1,2.55),
(47,2,2.55),
(47,3,0),
(47,4,0),
(47,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(48,1,40),
(48,2,40),
(48,3,50),
(48,4,80),
(48,5,100);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(49,1,10),
(49,2,14),
(49,3,20),
(49,4,30),
(49,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(50,1,0),
(50,2,0),
(50,3,3),
(50,4,5),
(50,5,5);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(51,1,0),
(51,2,30),
(51,3,35),
(51,4,35),
(51,5,35);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(52,1,30),
(52,2,30),
(52,3,35),
(52,4,35),
(52,5,35);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(53,1,80),
(53,2,80),
(53,3,90),
(53,4,100),
(53,5,120);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(54,1,0),
(54,2,4),
(54,3,6),
(54,4,8),
(54,5,10);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(55,1,0),
(55,2,8),
(55,3,13),
(55,4,15),
(55,5,17);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(56,1,0),
(56,2,15),
(56,3,20),
(56,4,30),
(56,5,30);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(57,1,0.5),
(57,2,1),
(57,3,1),
(57,4,1),
(57,5,1);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(58,1,0),
(58,2,10),
(58,3,10),
(58,4,15),
(58,5,15);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(59,1,10),
(59,2,10),
(59,3,10),
(59,4,12),
(59,5,13);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(60,1,5),
(60,2,5),
(60,3,5),
(60,4,6),
(60,5,6);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(61,1,6),
(61,2,6),
(61,3,8),
(61,4,8),
(61,5,8);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(62,1,0),
(62,2,4),
(62,3,6),
(62,4,6),
(62,5,6);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(63,1,0.5),
(63,2,0.5),
(63,3,1),
(63,4,1),
(63,5,1);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(64,1,0.1),
(64,2,0.1),
(64,3,0.1),
(64,4,0.1),
(64,5,0.1);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(65,1,40),
(65,2,50),
(65,3,80),
(65,4,100),
(65,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(66,1,40),
(66,2,50),
(66,3,80),
(66,4,100),
(66,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(67,1,15),
(67,2,24),
(67,3,30),
(67,4,36),
(67,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(68,1,15),
(68,2,24),
(68,3,30),
(68,4,36),
(68,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(69,1,50),
(69,2,50),
(69,3,80),
(69,4,80),
(69,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(70,1,14),
(70,2,16),
(70,3,22),
(70,4,24),
(70,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(71,1,7),
(71,2,8),
(71,3,11),
(71,4,12),
(71,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(72,1,10),
(72,2,12),
(72,3,17),
(72,4,19),
(72,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(73,1,4),
(73,2,4),
(73,3,5),
(73,4,5),
(73,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(74,1,50),
(74,2,50),
(74,3,50),
(74,4,50),
(74,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(75,1,105),
(75,2,160),
(75,3,200),
(75,4,240),
(75,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(76,1,60),
(76,2,120),
(76,3,140),
(76,4,180),
(76,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(77,1,120),
(77,2,180),
(77,3,240),
(77,4,300),
(77,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(78,1,0.1),
(78,2,0.1),
(78,3,0.1),
(78,4,0.1),
(78,5,0.1);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(79,1,0),
(79,2,0),
(79,3,0.5),
(79,4,0.5),
(79,5,0.5);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(80,1,0),
(80,2,0.5),
(80,3,1.5),
(80,4,1.5),
(80,5,1.5);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(81,1,0),
(81,2,0),
(81,3,1),
(81,4,1),
(81,5,1);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(82,1,2),
(82,2,2),
(82,3,4),
(82,4,4),
(82,5,4);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(83,1,5),
(83,2,5),
(83,3,5),
(83,4,5),
(83,5,5);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(84,1,25),
(84,2,25),
(84,3,25),
(84,4,25),
(84,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(85,1,0),
(85,2,5),
(85,3,5),
(85,4,5),
(85,5,0);

INSERT INTO racion_dosificacion
(id_tipo_preparacion, id_categoria_grupo, gr_ml)
VALUES
(86,1,1),
(86,2,1),
(86,3,1),
(86,4,1),
(86,5,0);