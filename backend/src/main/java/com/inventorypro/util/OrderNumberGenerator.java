package com.inventorypro.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

public class OrderNumberGenerator {
    
    private static final AtomicLong counter = new AtomicLong(1);
    private static final String PREFIX = "ORD";
    
    public static String generate() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long sequence = counter.getAndIncrement();
        return String.format("%s-%s-%04d", PREFIX, timestamp, sequence % 10000);
    }
}