/*
Created: 09/05/2026
Modified: 11/06/2026
Model: PostgreSQL (Professional Audit-Enabled)
Name: db_cunamas
*/

-- =========================================================
-- 1. TABLAS MAESTRAS
-- =========================================================

CREATE TABLE cat_tipo_documento
(
  id_documento SERIAL PRIMARY KEY,
  nombre_documento TEXT NOT NULL
);

CREATE TABLE cat_genero
(
  id_genero SERIAL PRIMARY KEY,
  nombre_genero TEXT NOT NULL
);

CREATE TABLE cat_roles
(
  id_rol SERIAL PRIMARY KEY,
  nombre_rol TEXT NOT NULL
);

CREATE TABLE departamento
(
  id_departamento SERIAL PRIMARY KEY,
  nombre_dpto TEXT NOT NULL
);

CREATE TABLE estado_asistencia
(
  id_estado_asistencia SERIAL PRIMARY KEY,
  nombre_estado TEXT NOT NULL
);

CREATE TABLE tipo_memorandum
(
  id_tipo_memorandum SERIAL PRIMARY KEY,
  nombre_tipo_memo TEXT NOT NULL
);

CREATE TABLE asistencia_geolocalizacion
(
  id_localizacion SERIAL PRIMARY KEY,
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8)
);

CREATE TABLE categorias_dosificacion
(
  id_categoria_grupo SERIAL PRIMARY KEY,
  nombre_categoria TEXT NOT NULL
);

CREATE TABLE categoria_alimento
(
  id_categoria_alimento SERIAL PRIMARY KEY,
  nombre_categoria_alimento TEXT NOT NULL
);

CREATE TABLE tipo_preparacion
(
  id_tipo_preparacion SERIAL PRIMARY KEY,
  id_persona INTEGER NOT NULL,
  id_categoria_alimento INTEGER NOT NULL,
  nombre_preparacion TEXT NOT NULL,
  porcion_comestible INTEGER NOT NULL
);

-- =========================================================
-- 2. TABLAS GEOGRÁFICAS (No requieren auditoría)
-- =========================================================

CREATE TABLE provincia
(
  id_provincia SERIAL PRIMARY KEY,
  id_departamento INTEGER NOT NULL,
  nombre_provincia TEXT NOT NULL
);

CREATE TABLE distrito
(
  id_distrito SERIAL PRIMARY KEY,
  id_provincia INTEGER NOT NULL,
  nombre_distrito TEXT NOT NULL,
  ubigeo INTEGER
);

CREATE TABLE direcciones
(
  id_direccion SERIAL PRIMARY KEY,
  nombre_direccion TEXT NOT NULL,
  id_distrito INTEGER NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 3. ENTIDADES PRINCIPALES (Auditoría Básica de Cambio)
-- =========================================================

CREATE TABLE persona
(
  id_persona SERIAL PRIMARY KEY,
  id_genero INTEGER NOT NULL,
  id_documento INTEGER NOT NULL,
  id_direccion INTEGER,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  ap_paterno TEXT NOT NULL,
  ap_materno TEXT,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER -- ID de la persona que editó este registro
);

CREATE TABLE cuenta_acceso
(
  id_cuenta SERIAL PRIMARY KEY,
  id_persona INTEGER NOT NULL,
  password TEXT NOT NULL,
  estado_cuenta BOOLEAN DEFAULT TRUE,
  
  -- Auditoría de seguridad
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER
);

CREATE TABLE servicio_alimentario
(
  id_centro_alimentario SERIAL PRIMARY KEY,
  id_direccion INTEGER NOT NULL,
  nombre_centro TEXT NOT NULL,
  nombre_comite TEXT,
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER
);

CREATE TABLE centro_atencion_infantil
(
  id_local SERIAL PRIMARY KEY,
  id_direccion INTEGER NOT NULL,
  id_centro_alimentario INTEGER,
  local_nombre TEXT NOT NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER
);

CREATE TABLE modulo
(
  id_modulo SERIAL PRIMARY KEY,
  id_local INTEGER NOT NULL,
  nombre_modulo TEXT NOT NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER
);

-- =========================================================
-- 4. TABLAS DE OPERACIÓN CRÍTICA (Auditoría Completa de Registro)
-- =========================================================

CREATE TABLE registro_asistencia_ciai
(
  id_registro_ninos SERIAL PRIMARY KEY,
  id_categoria_nino INTEGER NOT NULL,
  id_modulo INTEGER NOT NULL,
  registro_correlativo INTEGER,
  fecha DATE NOT NULL,
  cantidad INTEGER DEFAULT 0,
  
  -- Auditoría Avanzada
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_creacion INTEGER NOT NULL, -- Quién digitó el registro original
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER,      -- Quién alteró la asistencia de los niños
  CONSTRAINT uq_registro_fecha_modulo UNIQUE (fecha, id_modulo, id_categoria_nino, registro_correlativo)
);

CREATE TABLE asistencia_at
(
  id_asistencia_at BIGSERIAL PRIMARY KEY,
  id_persona INTEGER NOT NULL, -- Empleado que marca asistencia
  id_localizacion INTEGER,
  id_estado_asistencia INTEGER,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  t_ingreso TIMESTAMP,
  t_salida TIMESTAMP,
  minutos_tardanza INTEGER DEFAULT 0,
  url_imagen_ingreso TEXT,
  
  -- Auditoría (En marcas de asistencia, "modificacion" es vital por si un admin le borra una tardanza)
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER -- Administrador que justificó o editó la marca
);

CREATE TABLE memorandum
(
  id_memorandum SERIAL PRIMARY KEY,
  id_tipo_memorandum INTEGER NOT NULL,
  numero_memo VARCHAR(100) NOT NULL,
  url_memorandum TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_creacion INTEGER NOT NULL,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER
);

CREATE TABLE racion_dosificacion
(
  id_racion_dosificacion BIGSERIAL PRIMARY KEY,
  id_tipo_preparacion INTEGER NOT NULL,
  id_categoria_grupo INTEGER NOT NULL,
  gr_ml INTEGER NOT NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_modificacion INTEGER
);

-- =========================================================
-- 5. TABLAS INTERMEDIAS
-- =========================================================

CREATE TABLE persona_rol
(
  id_persona INTEGER NOT NULL,
  id_rol INTEGER NOT NULL,
  PRIMARY KEY (id_persona, id_rol)
);

CREATE TABLE justificaciones
(
  id_asistencia_at BIGINT NOT NULL,
  id_memorandum INTEGER NOT NULL,
  
  -- Auditoría (Saber quién vinculó el memo a la asistencia)
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_creacion INTEGER NOT NULL,
  PRIMARY KEY (id_asistencia_at, id_memorandum)
);


-- =========================================================
-- 6. FOREIGN KEYS (RELACIONES)
-- =========================================================

ALTER TABLE provincia
  ADD CONSTRAINT fk_provincia_departamento
  FOREIGN KEY (id_departamento) REFERENCES departamento (id_departamento);

ALTER TABLE distrito
  ADD CONSTRAINT fk_distrito_provincia
  FOREIGN KEY (id_provincia) REFERENCES provincia (id_provincia);

ALTER TABLE direcciones
  ADD CONSTRAINT fk_direcciones_distrito
  FOREIGN KEY (id_distrito) REFERENCES distrito (id_distrito);

ALTER TABLE persona
  ADD CONSTRAINT fk_persona_genero
  FOREIGN KEY (id_genero) REFERENCES cat_genero (id_genero);

ALTER TABLE persona
  ADD CONSTRAINT fk_persona_documento
  FOREIGN KEY (id_documento) REFERENCES cat_tipo_documento (id_documento);

ALTER TABLE persona
  ADD CONSTRAINT fk_persona_direccion
  FOREIGN KEY (id_direccion) REFERENCES direcciones (id_direccion);

ALTER TABLE persona
  ADD CONSTRAINT fk_persona_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE cuenta_acceso
  ADD CONSTRAINT fk_cuenta_persona
  FOREIGN KEY (id_persona) REFERENCES persona (id_persona);

ALTER TABLE cuenta_acceso
  ADD CONSTRAINT fk_cuenta_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE persona_rol
  ADD CONSTRAINT fk_persona_rol_persona
  FOREIGN KEY (id_persona) REFERENCES persona (id_persona);

ALTER TABLE persona_rol
  ADD CONSTRAINT fk_persona_rol_rol
  FOREIGN KEY (id_rol) REFERENCES cat_roles (id_rol);

ALTER TABLE servicio_alimentario
  ADD CONSTRAINT fk_servicio_alimentario_direccion
  FOREIGN KEY (id_direccion) REFERENCES direcciones (id_direccion);

ALTER TABLE servicio_alimentario
  ADD CONSTRAINT fk_servicio_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE centro_atencion_infantil
  ADD CONSTRAINT fk_centro_atencion_direccion
  FOREIGN KEY (id_direccion) REFERENCES direcciones (id_direccion);

ALTER TABLE centro_atencion_infantil
  ADD CONSTRAINT fk_centro_atencion_servicio
  FOREIGN KEY (id_centro_alimentario) REFERENCES servicio_alimentario (id_centro_alimentario);

ALTER TABLE centro_atencion_infantil
  ADD CONSTRAINT fk_centro_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE modulo
  ADD CONSTRAINT fk_modulo_centro
  FOREIGN KEY (id_local) REFERENCES centro_atencion_infantil (id_local);

ALTER TABLE modulo
  ADD CONSTRAINT fk_modulo_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE registro_asistencia_ciai
  ADD CONSTRAINT fk_registro_categoria
  FOREIGN KEY (id_categoria_nino) REFERENCES categorias_dosificacion (id_categoria_grupo);

ALTER TABLE registro_asistencia_ciai
  ADD CONSTRAINT fk_registro_modulo
  FOREIGN KEY (id_modulo) REFERENCES modulo (id_modulo);

ALTER TABLE registro_asistencia_ciai
  ADD CONSTRAINT fk_registro_usuario_crea
  FOREIGN KEY (id_usuario_creacion) REFERENCES persona (id_persona);

ALTER TABLE registro_asistencia_ciai
  ADD CONSTRAINT fk_registro_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE asistencia_at
  ADD CONSTRAINT fk_asistencia_persona
  FOREIGN KEY (id_persona) REFERENCES persona (id_persona);

ALTER TABLE asistencia_at
  ADD CONSTRAINT fk_asistencia_estado
  FOREIGN KEY (id_estado_asistencia) REFERENCES estado_asistencia (id_estado_asistencia);

ALTER TABLE asistencia_at
  ADD CONSTRAINT fk_asistencia_geolocalizacion
  FOREIGN KEY (id_localizacion) REFERENCES asistencia_geolocalizacion (id_localizacion);

ALTER TABLE asistencia_at
  ADD CONSTRAINT fk_asistencia_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE memorandum
  ADD CONSTRAINT fk_memorandum_tipo
  FOREIGN KEY (id_tipo_memorandum) REFERENCES tipo_memorandum (id_tipo_memorandum);

ALTER TABLE memorandum
  ADD CONSTRAINT fk_memo_usuario_crea
  FOREIGN KEY (id_usuario_creacion) REFERENCES persona (id_persona);

ALTER TABLE memorandum
  ADD CONSTRAINT fk_memo_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);

ALTER TABLE justificaciones
  ADD CONSTRAINT fk_justificaciones_asistencia
  FOREIGN KEY (id_asistencia_at) REFERENCES asistencia_at (id_asistencia_at);

ALTER TABLE justificaciones
  ADD CONSTRAINT fk_justificaciones_memorandum
  FOREIGN KEY (id_memorandum) REFERENCES memorandum (id_memorandum);

ALTER TABLE justificaciones
  ADD CONSTRAINT fk_justificaciones_usuario_crea
  FOREIGN KEY (id_usuario_creacion) REFERENCES persona (id_persona);

ALTER TABLE tipo_preparacion
  ADD CONSTRAINT fk_tipo_preparacion_persona
  FOREIGN KEY (id_persona) REFERENCES persona (id_persona);

ALTER TABLE tipo_preparacion
  ADD CONSTRAINT fk_tipo_preparacion_categoria
  FOREIGN KEY (id_categoria_alimento) REFERENCES categoria_alimento (id_categoria_alimento);

ALTER TABLE racion_dosificacion
  ADD CONSTRAINT fk_racion_dosificacion_preparacion
  FOREIGN KEY (id_tipo_preparacion) REFERENCES tipo_preparacion (id_tipo_preparacion);
  
ALTER TABLE racion_dosificacion
  ADD CONSTRAINT fk_racion_categoria
  FOREIGN KEY (id_categoria_grupo) REFERENCES categorias_dosificacion (id_categoria_grupo);

ALTER TABLE racion_dosificacion
  ADD CONSTRAINT fk_racion_usuario_mod
  FOREIGN KEY (id_usuario_modificacion) REFERENCES persona (id_persona);