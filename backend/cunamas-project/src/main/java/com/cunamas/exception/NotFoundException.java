
package com.cunamas.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends BusinessException {

    public NotFoundException(String mensaje) {
        super(mensaje, HttpStatus.NOT_FOUND);
    }
}