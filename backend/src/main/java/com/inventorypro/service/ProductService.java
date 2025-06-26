package com.inventorypro.service;

import com.inventorypro.dto.request.ProductRequest;
import com.inventorypro.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    
    Product createProduct(ProductRequest productRequest);
    
    Optional<Product> findById(Long id);
    
    Optional<Product> findBySku(String sku);
    
    List<Product> getAllActiveProducts();
    
    Page<Product> searchProducts(String keyword, Pageable pageable);
    
    List<String> getAllCategories();
    
    Product updateProduct(Long id, ProductRequest productRequest);
    
    void deleteProduct(Long id);
    
    Boolean existsBySku(String sku);
}