package com.inventorypro.service.impl;

import com.inventorypro.dto.request.ProductRequest;
import com.inventorypro.dto.request.ProductVariantRequest;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.model.Product;
import com.inventorypro.model.ProductVariant;
import com.inventorypro.repository.ProductRepository;
import com.inventorypro.service.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Product createProduct(ProductRequest productRequest) {
        Product product = modelMapper.map(productRequest, Product.class);

        if (productRequest.getVariants() != null) {
            List<ProductVariant> variants = productRequest.getVariants().stream()
                    .map(variantRequest -> {
                        ProductVariant variant = modelMapper.map(variantRequest, ProductVariant.class);
                        variant.setProduct(product);
                        return variant;
                    })
                    .collect(Collectors.toList());
            product.setVariants(variants);
        }

        return productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findBySku(String sku) {
        return productRepository.findBySku(sku);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getAllActiveProducts() {
        return productRepository.findAllActiveProducts();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProducts(keyword, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    @Override
    public Product updateProduct(Long id, ProductRequest productRequest) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        modelMapper.map(productRequest, existingProduct);

        if (productRequest.getVariants() != null) {
            // Clear existing variants
            existingProduct.getVariants().clear();

            // Add new variants
            List<ProductVariant> variants = productRequest.getVariants().stream()
                    .map(variantRequest -> {
                        ProductVariant variant = modelMapper.map(variantRequest, ProductVariant.class);
                        variant.setProduct(existingProduct);
                        return variant;
                    })
                    .collect(Collectors.toList());
            existingProduct.setVariants(variants);
        }

        return productRepository.save(existingProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean existsBySku(String sku) {
        return productRepository.existsBySku(sku);
    }
}