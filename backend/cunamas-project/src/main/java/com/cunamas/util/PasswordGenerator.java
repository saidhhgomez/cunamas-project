package com.cunamas.util;

import java.security.SecureRandom;

public class PasswordGenerator {

    private static final String MAYUSCULAS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private static final String MINUSCULAS =
            "abcdefghijklmnopqrstuvwxyz";

    private static final String NUMEROS =
            "0123456789";

    private static final String ESPECIALES =
            "!@#$%&*?";

    private static final String TODOS =
            MAYUSCULAS
                    + MINUSCULAS
                    + NUMEROS
                    + ESPECIALES;

    private static final SecureRandom RANDOM =
            new SecureRandom();

    public static String generarPasswordTemporal() {

        StringBuilder sb = new StringBuilder();

        sb.append(
                MAYUSCULAS.charAt(
                        RANDOM.nextInt(MAYUSCULAS.length())
                )
        );

        sb.append(
                MINUSCULAS.charAt(
                        RANDOM.nextInt(MINUSCULAS.length())
                )
        );

        sb.append(
                NUMEROS.charAt(
                        RANDOM.nextInt(NUMEROS.length())
                )
        );

        sb.append(
                ESPECIALES.charAt(
                        RANDOM.nextInt(ESPECIALES.length())
                )
        );

        for (int i = 4; i < 12; i++) {

            sb.append(
                    TODOS.charAt(
                            RANDOM.nextInt(TODOS.length())
                    )
            );

        }

        return sb.toString();
    }

}