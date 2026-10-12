package com.cunamas.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends BusinessException {

    public ConflictException(String mensaje) {
        super(mensaje, HttpStatus.CONFLICT);
    }
}