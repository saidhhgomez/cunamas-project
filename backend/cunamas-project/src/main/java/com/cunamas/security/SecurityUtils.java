package com.cunamas.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SecurityUtils {

    public Authentication getAuthentication() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Usuario no autenticado."
            );

        }

        return authentication;

    }

    public Integer getIdPersona() {

        return (Integer)
                getAuthentication()
                        .getPrincipal();

    }

    public List<String> getRoles() {

        return getAuthentication()

                .getAuthorities()

                .stream()

                .map(a -> a.getAuthority())

                .toList();

    }

    public boolean tieneRol(String rol) {

        return getRoles().contains(rol);

    }

    public boolean esAdministrador() {

        return tieneRol(
                "Asistente Técnico (AT)"
        );

    }

    public boolean esExpertaNutricion() {

        return tieneRol(
                "Experta en Nutrición"
        );

    }

    public boolean puedeAdministrarUsuarios() {

        return esAdministrador()
                || esExpertaNutricion();

    }



}