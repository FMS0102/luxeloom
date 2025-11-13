package com.fms.backend.exceptions;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public record ExceptionResponse (
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        Date timestamp,
        String message,
        String details
){
}
