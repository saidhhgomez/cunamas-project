package com.cunamas.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends BusinessException {

    public ForbiddenException(String mensaje) {
        super(mensaje, HttpStatus.FORBIDDEN);
    }
}