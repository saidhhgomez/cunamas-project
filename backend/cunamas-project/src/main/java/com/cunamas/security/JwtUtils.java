package com.cunamas.security;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtUtils {

    private final JwtService jwtService;

    public String obtenerToken(String authorization) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            throw new RuntimeException("Token no enviado.");
        }

        return authorization.substring(7);
    }

    public Integer obtenerIdPersona(String authorization) {

        String token = obtenerToken(authorization);

        Claims claims =
                jwtService.obtenerClaims(token);

        return claims.get("idPersona", Integer.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> obtenerRoles(String authorization) {

        String token = obtenerToken(authorization);

        Claims claims =
                jwtService.obtenerClaims(token);

        return (List<String>) claims.get("roles");
    }

    public boolean tieneRol(
            String authorization,
            String rol
    ) {

        return obtenerRoles(authorization)
                .contains(rol);
    }

}