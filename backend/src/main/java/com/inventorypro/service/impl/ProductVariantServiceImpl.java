package com.inventorypro.service.impl;

import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.model.*;
import com.inventorypro.repository.*;
import com.inventorypro.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * ADR 02: Enhanced Product Variant Service Implementation
 * Implements dynamic variant generation and management
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryRepository;
    private final VariantSearchAttributeRepository variantSearchRepository;

    /**
     * ADR 02: Generate variants based on product type and attributes
     * Hành động 1: Tạo các Biến thể (Variant Generation)
     */
    @Override
    public List<ProductVariant> generateVariants(Product product, Map<String, Object> baseAttributes) {
        log.info("Generating variants for product: {}", product.getId());
        
        ProductType productType = product.getProductType();
        if (productType == null || productType.getAttributeDefinitions() == null) {
            log.warn("No product type or attribute definitions found for product: {}", product.getId());
            return Collections.emptyList();
        }

        // Extract variant-creating attributes
        Map<String, List<String>> variantAttributes = extractVariantAttributes(productType);
        
        if (variantAttributes.isEmpty()) {
            log.info("No variant attributes found, creating single variant");
            return createSingleVariant(product, baseAttributes);
        }

        // Generate all combinations
        List<Map<String, String>> combinations = generateAttributeCombinations(variantAttributes);
        
        List<ProductVariant> variants = new ArrayList<>();
        int index = 1;
        
        for (Map<String, String> combination : combinations) {
            ProductVariant variant = createVariantFromCombination(product, combination, baseAttributes, index++);
            variants.add(variant);
        }

        log.info("Generated {} variants for product: {}", variants.size(), product.getId());
        return variants;
    }

    /**
     * ADR 02: Validate variant data against product type definitions
     * Hành động 2: Validation Dữ liệu
     */
    @Override
    public boolean validateVariantAttributes(ProductVariant variant, ProductType productType) {
        if (productType.getAttributeDefinitions() == null) {
            return true; // No validation rules defined
        }

        Map<String, Object> attributeDefinitions = productType.getAttributeDefinitions();
        Map<String, Object> variantAttributes = variant.getAttributes();

        for (Map.Entry<String, Object> entry : attributeDefinitions.entrySet()) {
            String attributeName = entry.getKey();
            Map<String, Object> definition = (Map<String, Object>) entry.getValue();
            
            boolean required = (Boolean) definition.getOrDefault("required", false);
            String type = (String) definition.get("type");
            
            Object value = variantAttributes.get(attributeName);
            
            // Check required attributes
            if (required && (value == null || value.toString().trim().isEmpty())) {
                log.error("Required attribute '{}' is missing for variant: {}", attributeName, variant.getId());
                return false;
            }
            
            // Validate type
            if (value != null && !validateAttributeType(value, type, definition)) {
                log.error("Invalid type for attribute '{}' in variant: {}", attributeName, variant.getId());
                return false;
            }
        }

        return true;
    }

    /**
     * ADR 02: Get all available options for a product (for PDP)
     * Hành động 3: Tổng hợp các Tùy chọn có sẵn (Aggregating Available Options)
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, List<String>> getAvailableOptions(Long productId) {
        log.info("Getting available options for product: {}", productId);
        
        List<ProductVariant> variants = variantRepository.findActiveVariantsByProductId(productId);
        Map<String, Set<String>> optionsMap = new HashMap<>();
        
        for (ProductVariant variant : variants) {
            // Only include options from variants that have stock
            if (hasAvailableStock(variant)) {
                Map<String, Object> attributes = variant.getAttributes();
                if (attributes != null) {
                    for (Map.Entry<String, Object> entry : attributes.entrySet()) {
                        optionsMap.computeIfAbsent(entry.getKey(), k -> new HashSet<>())
                                 .add(entry.getValue().toString());
                    }
                }
            }
        }
        
        // Convert to sorted lists
        Map<String, List<String>> result = new HashMap<>();
        for (Map.Entry<String, Set<String>> entry : optionsMap.entrySet()) {
            List<String> sortedOptions = new ArrayList<>(entry.getValue());
            Collections.sort(sortedOptions);
            result.put(entry.getKey(), sortedOptions);
        }
        
        log.info("Found {} available option types for product: {}", result.size(), productId);
        return result;
    }

    /**
     * ADR 02: Map variant states (available, out of stock, etc.)
     * Hành động 4: Ánh xạ Trạng thái Biến thể (Mapping Variant States)
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getVariantStates(Long productId) {
        log.info("Getting variant states for product: {}", productId);
        
        List<ProductVariant> variants = variantRepository.findActiveVariantsByProductId(productId);
        Map<String, Object> states = new HashMap<>();
        
        Map<String, String> variantAvailability = new HashMap<>();
        Map<String, Integer> variantStock = new HashMap<>();
        Map<String, Double> variantPrices = new HashMap<>();
        
        for (ProductVariant variant : variants) {
            String variantKey = generateVariantKey(variant.getAttributes());
            
            // Determine availability
            boolean hasStock = hasAvailableStock(variant);
            variantAvailability.put(variantKey, hasStock ? "available" : "out_of_stock");
            
            // Get stock level
            Integer stock = getVariantStock(variant);
            variantStock.put(variantKey, stock);
            
            // Get price
            variantPrices.put(variantKey, variant.getPrice().doubleValue());
        }
        
        states.put("availability", variantAvailability);
        states.put("stock", variantStock);
        states.put("prices", variantPrices);
        
        log.info("Generated states for {} variants of product: {}", variants.size(), productId);
        return states;
    }

    /**
     * ADR 02: Find variant by product and selected attributes
     * Hành động 5: Tìm kiếm Biến thể dựa trên Tùy chọn (Variant Lookup)
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProductVariant> findVariantByAttributes(Long productId, Map<String, String> selectedAttributes) {
        log.info("Finding variant for product: {} with attributes: {}", productId, selectedAttributes);
        
        List<ProductVariant> variants = variantRepository.findActiveVariantsByProductId(productId);
        
        for (ProductVariant variant : variants) {
            if (attributesMatch(variant.getAttributes(), selectedAttributes)) {
                log.info("Found matching variant: {}", variant.getId());
                return Optional.of(variant);
            }
        }
        
        log.warn("No variant found for product: {} with attributes: {}", productId, selectedAttributes);
        return Optional.empty();
    }

    // =====================================================
    // STANDARD CRUD OPERATIONS
    // =====================================================

    @Override
    public ProductVariant createVariant(ProductVariant variant) {
        log.info("Creating variant: {}", variant.getSku());
        
        ProductVariant savedVariant = variantRepository.save(variant);
        
        // Create search attributes for efficient lookup
        createSearchAttributes(savedVariant);
        
        return savedVariant;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductVariant> findById(Long id) {
        return variantRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariant> findByProductId(Long productId) {
        return variantRepository.findByProductId(productId);
    }

    @Override
    public ProductVariant updateVariant(Long id, ProductVariant variant) {
        ProductVariant existingVariant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        existingVariant.setName(variant.getName());
        existingVariant.setSku(variant.getSku());
        existingVariant.setPrice(variant.getPrice());
        existingVariant.setCost(variant.getCost());
        existingVariant.setStock(variant.getStock());
        existingVariant.setAttributes(variant.getAttributes());
        existingVariant.setActive(variant.getActive());

        ProductVariant savedVariant = variantRepository.save(existingVariant);
        
        // Update search attributes
        updateSearchAttributes(savedVariant);
        
        return savedVariant;
    }

    @Override
    public void deleteVariant(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        variant.setActive(false);
        variantRepository.save(variant);
        
        // Remove search attributes
        variantSearchRepository.deleteByVariantId(id);
    }

    @Override
    public List<ProductVariant> createVariants(List<ProductVariant> variants) {
        List<ProductVariant> savedVariants = variantRepository.saveAll(variants);
        
        // Create search attributes for all variants
        for (ProductVariant variant : savedVariants) {
            createSearchAttributes(variant);
        }
        
        return savedVariants;
    }

    @Override
    public void updateVariantStock(Long variantId, Integer newStock) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", variantId));
        
        variant.setStock(newStock);
        variantRepository.save(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductVariant> searchVariants(String keyword, Pageable pageable) {
        return variantRepository.searchVariants(keyword, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariant> findVariantsByAttributes(Map<String, String> attributes) {
        // Implementation for finding variants by specific attributes
        return variantRepository.findByAttributesContaining(attributes);
    }

    // =====================================================
    // PRIVATE HELPER METHODS
    // =====================================================

    private Map<String, List<String>> extractVariantAttributes(ProductType productType) {
        Map<String, List<String>> variantAttributes = new HashMap<>();
        Map<String, Object> definitions = productType.getAttributeDefinitions();
        
        for (Map.Entry<String, Object> entry : definitions.entrySet()) {
            Map<String, Object> definition = (Map<String, Object>) entry.getValue();
            Boolean isVariant = (Boolean) definition.getOrDefault("variant", false);
            
            if (isVariant) {
                String type = (String) definition.get("type");
                if ("select".equals(type)) {
                    List<String> options = (List<String>) definition.get("options");
                    if (options != null && !options.isEmpty()) {
                        variantAttributes.put(entry.getKey(), options);
                    }
                }
            }
        }
        
        return variantAttributes;
    }

    private List<Map<String, String>> generateAttributeCombinations(Map<String, List<String>> variantAttributes) {
        List<Map<String, String>> combinations = new ArrayList<>();
        generateCombinationsRecursive(variantAttributes, new HashMap<>(), 
                                    new ArrayList<>(variantAttributes.keySet()), 0, combinations);
        return combinations;
    }

    private void generateCombinationsRecursive(Map<String, List<String>> variantAttributes,
                                             Map<String, String> current,
                                             List<String> attributeNames,
                                             int index,
                                             List<Map<String, String>> combinations) {
        if (index == attributeNames.size()) {
            combinations.add(new HashMap<>(current));
            return;
        }
        
        String attributeName = attributeNames.get(index);
        List<String> values = variantAttributes.get(attributeName);
        
        for (String value : values) {
            current.put(attributeName, value);
            generateCombinationsRecursive(variantAttributes, current, attributeNames, index + 1, combinations);
            current.remove(attributeName);
        }
    }

    private List<ProductVariant> createSingleVariant(Product product, Map<String, Object> baseAttributes) {
        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .name(product.getName())
                .sku(product.getSku() + "-DEFAULT")
                .price(product.getPrice())
                .cost(product.getCost())
                .stock(0)
                .attributes(baseAttributes)
                .active(true)
                .build();
        
        return Collections.singletonList(variant);
    }

    private ProductVariant createVariantFromCombination(Product product, 
                                                      Map<String, String> combination,
                                                      Map<String, Object> baseAttributes,
                                                      int index) {
        // Merge base attributes with variant-specific attributes
        Map<String, Object> variantAttributes = new HashMap<>(baseAttributes);
        variantAttributes.putAll(combination);
        
        // Generate variant name from combination
        String variantName = combination.values().stream()
                .collect(Collectors.joining(" - "));
        
        // Generate SKU
        String skuSuffix = combination.values().stream()
                .map(v -> v.replaceAll("[^A-Za-z0-9]", "").toUpperCase())
                .collect(Collectors.joining("-"));
        
        return ProductVariant.builder()
                .product(product)
                .name(product.getName() + " - " + variantName)
                .sku(product.getSku() + "-" + skuSuffix)
                .price(product.getPrice())
                .cost(product.getCost())
                .stock(0)
                .attributes(variantAttributes)
                .active(true)
                .build();
    }

    private boolean validateAttributeType(Object value, String type, Map<String, Object> definition) {
        switch (type) {
            case "string":
                return value instanceof String;
            case "number":
                return value instanceof Number;
            case "boolean":
                return value instanceof Boolean;
            case "select":
                List<String> options = (List<String>) definition.get("options");
                return options != null && options.contains(value.toString());
            default:
                return true;
        }
    }

    private boolean hasAvailableStock(ProductVariant variant) {
        return variant.getStock() != null && variant.getStock() > 0;
    }

    private Integer getVariantStock(ProductVariant variant) {
        return variant.getStock() != null ? variant.getStock() : 0;
    }

    private String generateVariantKey(Map<String, Object> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            return "default";
        }
        
        return attributes.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getKey() + ":" + entry.getValue())
                .collect(Collectors.joining("|"));
    }

    private boolean attributesMatch(Map<String, Object> variantAttributes, Map<String, String> selectedAttributes) {
        if (selectedAttributes == null || selectedAttributes.isEmpty()) {
            return true;
        }
        
        for (Map.Entry<String, String> entry : selectedAttributes.entrySet()) {
            Object variantValue = variantAttributes.get(entry.getKey());
            if (variantValue == null || !variantValue.toString().equals(entry.getValue())) {
                return false;
            }
        }
        
        return true;
    }

    private void createSearchAttributes(ProductVariant variant) {
        // Remove existing search attributes
        variantSearchRepository.deleteByVariantId(variant.getId());
        
        if (variant.getAttributes() != null) {
            List<VariantSearchAttribute> searchAttributes = new ArrayList<>();
            
            for (Map.Entry<String, Object> entry : variant.getAttributes().entrySet()) {
                VariantSearchAttribute searchAttr = VariantSearchAttribute.builder()
                        .variantId(variant.getId())
                        .productId(variant.getProduct().getId())
                        .attributeName(entry.getKey())
                        .attributeValue(entry.getValue().toString())
                        .build();
                
                searchAttributes.add(searchAttr);
            }
            
            variantSearchRepository.saveAll(searchAttributes);
        }
    }

    private void updateSearchAttributes(ProductVariant variant) {
        createSearchAttributes(variant); // This method already handles deletion
    }
}