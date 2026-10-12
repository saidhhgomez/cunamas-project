package com.example.cunamas.core.auth.domain

enum class Role(val nombreBackend: String, val idBackend: Int) {
    ASISTENTE_TECNICO("Asistente Técnico (AT)", 1),
    SOCIA_COCINA_TIPO1("Socia de Cocina Tipo 1", 2),
    SOCIA_COCINA_TIPO2("Socia de Cocina Tipo 2", 3),
    EXPERTA_NUTRICION("Experta en Nutrición", 4),
    MADRE_CUIDADORA("Madre Cuidadora", 5),
    MADRE_GUIA("Madre Guía", 6),
    ADMINISTRADOR("Administrador", -1),
    DESCONOCIDO("", -1);

    companion object {
        fun fromBackend(nombre: String): Role {
            return entries.find { it.nombreBackend.equals(nombre, ignoreCase = true) }
                ?: DESCONOCIDO
        }

        fun fromId(id: Int): Role {
            return entries.find { it.idBackend == id && it != ADMINISTRADOR } ?: DESCONOCIDO
        }

        fun rolesAsignables(): List<Role> {
            return entries.filter { it != ADMINISTRADOR && it != DESCONOCIDO }
        }
    }
}