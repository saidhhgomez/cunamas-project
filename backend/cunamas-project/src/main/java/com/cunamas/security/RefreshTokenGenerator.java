package com.cunamas.security;

import java.security.SecureRandom;
import java.util.Base64;

public final class RefreshTokenGenerator {

    private static final SecureRandom RANDOM =
            new SecureRandom();

    private RefreshTokenGenerator() {
    }

    public static String generar() {

        byte[] bytes = new byte[64];

        RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

    }

}