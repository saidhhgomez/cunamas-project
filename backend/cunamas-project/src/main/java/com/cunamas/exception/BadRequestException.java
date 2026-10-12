package com.cunamas.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends BusinessException {

    public BadRequestException(String mensaje) {
        super(mensaje, HttpStatus.BAD_REQUEST);
    }
}