package com.example.cunamas.core.auth.domain


enum class RoleGroup(val roles: List<Role>, val rutaGraph: String) {
    GESTION(
        roles = listOf(Role.ADMINISTRADOR, Role.ASISTENTE_TECNICO, Role.EXPERTA_NUTRICION),   // 👈 corregido
        rutaGraph = "gestion_graph"
    ),
    COCINA(
        roles = listOf(Role.SOCIA_COCINA_TIPO1, Role.SOCIA_COCINA_TIPO2),
        rutaGraph = "cocina_graph"
    ),
    MADRES(
        roles = listOf(Role.MADRE_CUIDADORA, Role.MADRE_GUIA),
        rutaGraph = "madre_graph"
    );

    companion object {
        fun paraRol(role: Role): RoleGroup? {
            return entries.find { role in it.roles }
        }
    }
}