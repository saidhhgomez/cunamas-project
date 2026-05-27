/*
Created: 09/05/2026
Modified: 27/05/2026
Model: PostgreSQL
*/

-- =========================================================
-- TABLAS
-- =========================================================

-- =========================
-- cat_tipo_documento
-- =========================

CREATE TABLE cat_tipo_documento
(
  id_documento SERIAL PRIMARY KEY,
  nombre_documento TEXT NOT NULL
);

-- =========================
-- cat_genero
-- =========================

CREATE TABLE cat_genero
(
  id_genero SERIAL PRIMARY KEY,
  nombre_genero TEXT NOT NULL
);

-- =========================
-- cat_roles
-- =========================

CREATE TABLE cat_roles
(
  id_rol SERIAL PRIMARY KEY,
  nombre_rol TEXT NOT NULL
);

-- =========================
-- departamento
-- =========================

CREATE TABLE departamento
(
  id_departamento SERIAL PRIMARY KEY,
  nombre_depto TEXT NOT NULL
);

-- =========================
-- provincia
-- =========================

CREATE TABLE provincia
(
  id_provincia SERIAL PRIMARY KEY,
  id_departamento INTEGER NOT NULL,
  nombre_provincia TEXT NOT NULL
);

-- =========================
-- distrito
-- =========================

CREATE TABLE distrito
(
  id_distrito SERIAL PRIMARY KEY,
  id_provincia INTEGER NOT NULL,
  nombre_distrito TEXT NOT NULL,
  ubigeo INTEGER
);

-- =========================
-- direcciones
-- =========================

CREATE TABLE direcciones
(
  id_direccion SERIAL PRIMARY KEY,
  nombre_direccion TEXT NOT NULL,
  id_distrito INTEGER NOT NULL,

  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- persona
-- =========================

CREATE TABLE persona
(
  id_persona SERIAL PRIMARY KEY,

  id_genero INTEGER NOT NULL,

  id_documento INTEGER NOT NULL,

  numero_documento VARCHAR(20) NOT NULL UNIQUE,

  nombres TEXT NOT NULL,

  ap_paterno TEXT NOT NULL,

  ap_materno TEXT,

  telefono VARCHAR(20),

  fecha_nacimiento DATE,

  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  id_direccion INTEGER
);

-- =========================
-- cuenta_acceso
-- =========================

CREATE TABLE cuenta_acceso
(
  id_cuenta SERIAL PRIMARY KEY,

  id_persona INTEGER NOT NULL,

  password TEXT NOT NULL,

  estado_cuenta BOOLEAN NOT NULL DEFAULT TRUE,

  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- persona_rol
-- =========================

CREATE TABLE persona_rol
(
  id_persona INTEGER,
  id_rol INTEGER,

  PRIMARY KEY (id_persona, id_rol)
);

-- =========================
-- cat_tipo_centro
-- =========================

CREATE TABLE cat_tipo_centro
(
  id_tipo_centro SERIAL PRIMARY KEY,
  nombre_tipo_centro TEXT NOT NULL
);

-- =========================
-- locales
-- =========================

CREATE TABLE locales
(
  id_local SERIAL PRIMARY KEY,

  id_direccion INTEGER NOT NULL,

  id_tipo_centro INTEGER NOT NULL,

    nombre_local TEXT NOT NULL

);

-- =========================
-- modulo
-- =========================

CREATE TABLE modulo
(
  id_modulo SERIAL PRIMARY KEY,

  nombre_modulo TEXT NOT NULL,

  id_local INTEGER NOT NULL
);

-- =========================
-- categoria_nino
-- =========================

CREATE TABLE categoria_nino
(
  id_categoria_nino SERIAL PRIMARY KEY,

  categoria TEXT NOT NULL,

  edad_inicio_meses INTEGER NOT NULL,

  edad_fin_meses INTEGER NOT NULL
);

-- =========================
-- registro_ninos
-- =========================

CREATE TABLE registro_ninos
(
  id_registro_ninos SERIAL PRIMARY KEY,

  id_local INTEGER NOT NULL,

  id_categoria_nino INTEGER NOT NULL,

  fecha DATE NOT NULL,

  cantidad INTEGER NOT NULL DEFAULT 0
);

-- UNIQUE
ALTER TABLE registro_ninos
ADD CONSTRAINT uq_registro_ninos
UNIQUE (
    fecha,
    id_local,
    id_categoria_nino
);

-- =========================
-- estado_asistencia
-- =========================

CREATE TABLE estado_asistencia
(
  id_estado_asistencia SERIAL PRIMARY KEY,
  nombre_estado TEXT NOT NULL
);

-- =========================
-- asistencia_geolocalizacion
-- =========================

CREATE TABLE asistencia_geolocalizacion
(
  id_localizacion SERIAL PRIMARY KEY,

  latitud DECIMAL(10,8),

  longitud DECIMAL(11,8)
);

-- =========================
-- asistencia_at
-- =========================

CREATE TABLE asistencia_at
(
  id_asistencia_at BIGSERIAL PRIMARY KEY,

  id_persona INTEGER NOT NULL,

  id_estado_asistencia INTEGER,

  id_localizacion INTEGER,

  fecha DATE NOT NULL DEFAULT CURRENT_DATE,

  t_ingreso TIME,

  t_salida TIME,

  minutos_tardanza INTEGER DEFAULT 0,

  compenso BOOLEAN DEFAULT FALSE,

  minutos_compensados INTEGER DEFAULT 0,

  url_imagen_ingreso TEXT,

  url_imagen_salida TEXT
);

-- =========================
-- tipo_memorandum
-- =========================

CREATE TABLE tipo_memorandum
(
  id_tipo_memorandum SERIAL PRIMARY KEY,

  nombre_tipo_memo TEXT NOT NULL
);

-- =========================
-- memorandum
-- =========================

CREATE TABLE memorandum
(
  id_memorandum SERIAL PRIMARY KEY,

  id_tipo_memorandum INTEGER NOT NULL,

  numero_memo VARCHAR(100) NOT NULL,

  url_memorandum TEXT,

  fecha_inicio DATE NOT NULL,

  fecha_fin DATE NOT NULL
);

-- =========================
-- justificaciones
-- =========================

CREATE TABLE justificaciones
(
  id_asistencia_at BIGINT,

  id_memorandum INTEGER,

  PRIMARY KEY (
      id_asistencia_at,
      id_memorandum
  )
);

-- =========================================================
-- FOREIGN KEYS
-- =========================================================

ALTER TABLE provincia
ADD CONSTRAINT fk_provincia_departamento
FOREIGN KEY (id_departamento)
REFERENCES departamento(id_departamento);

ALTER TABLE distrito
ADD CONSTRAINT fk_distrito_provincia
FOREIGN KEY (id_provincia)
REFERENCES provincia(id_provincia);

ALTER TABLE direcciones
ADD CONSTRAINT fk_direccion_distrito
FOREIGN KEY (id_distrito)
REFERENCES distrito(id_distrito);

ALTER TABLE persona
ADD CONSTRAINT fk_persona_genero
FOREIGN KEY (id_genero)
REFERENCES cat_genero(id_genero);

ALTER TABLE persona
ADD CONSTRAINT fk_persona_documento
FOREIGN KEY (id_documento)
REFERENCES cat_tipo_documento(id_documento);

ALTER TABLE persona
ADD CONSTRAINT fk_persona_direccion
FOREIGN KEY (id_direccion)
REFERENCES direcciones(id_direccion);

ALTER TABLE cuenta_acceso
ADD CONSTRAINT fk_cuenta_persona
FOREIGN KEY (id_persona)
REFERENCES persona(id_persona);

ALTER TABLE persona_rol
ADD CONSTRAINT fk_persona_rol_persona
FOREIGN KEY (id_persona)
REFERENCES persona(id_persona);

ALTER TABLE persona_rol
ADD CONSTRAINT fk_persona_rol_rol
FOREIGN KEY (id_rol)
REFERENCES cat_roles(id_rol);

ALTER TABLE locales
ADD CONSTRAINT fk_local_direccion
FOREIGN KEY (id_direccion)
REFERENCES direcciones(id_direccion);

ALTER TABLE locales
ADD CONSTRAINT fk_local_tipo
FOREIGN KEY (id_tipo_centro)
REFERENCES cat_tipo_centro(id_tipo_centro);

ALTER TABLE modulo
ADD CONSTRAINT fk_modulo_local
FOREIGN KEY (id_local)
REFERENCES locales(id_local);

ALTER TABLE registro_ninos
ADD CONSTRAINT fk_registro_local
FOREIGN KEY (id_local)
REFERENCES locales(id_local);

ALTER TABLE registro_ninos
ADD CONSTRAINT fk_registro_categoria
FOREIGN KEY (id_categoria_nino)
REFERENCES categoria_nino(id_categoria_nino);

ALTER TABLE asistencia_at
ADD CONSTRAINT fk_asistencia_persona
FOREIGN KEY (id_persona)
REFERENCES persona(id_persona);

ALTER TABLE asistencia_at
ADD CONSTRAINT fk_asistencia_estado
FOREIGN KEY (id_estado_asistencia)
REFERENCES estado_asistencia(id_estado_asistencia);

ALTER TABLE asistencia_at
ADD CONSTRAINT fk_asistencia_geo
FOREIGN KEY (id_localizacion)
REFERENCES asistencia_geolocalizacion(id_localizacion);

ALTER TABLE memorandum
ADD CONSTRAINT fk_memorandum_tipo
FOREIGN KEY (id_tipo_memorandum)
REFERENCES tipo_memorandum(id_tipo_memorandum);

ALTER TABLE justificaciones
ADD CONSTRAINT fk_justificacion_asistencia
FOREIGN KEY (id_asistencia_at)
REFERENCES asistencia_at(id_asistencia_at);

ALTER TABLE justificaciones
ADD CONSTRAINT fk_justificacion_memorandum
FOREIGN KEY (id_memorandum)
REFERENCES memorandum(id_memorandum);