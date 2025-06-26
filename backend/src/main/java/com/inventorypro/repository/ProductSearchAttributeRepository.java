package com.inventorypro.repository;

import com.inventorypro.model.ProductSearchAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ProductSearchAttributeRepository extends JpaRepository<ProductSearchAttribute, Long> {
    
    @Query("SELECT DISTINCT psa.attributeName, psa.attributeValue FROM ProductSearchAttribute psa " +
           "JOIN Product p ON psa.productId = p.id " +
           "WHERE p.category.id = :categoryId AND p.active = true AND psa.filterable = true")
    List<Object[]> findFiltersByCategoryId(@Param("categoryId") Long categoryId);
    
    @Query("SELECT DISTINCT psa.attributeName, psa.attributeValue FROM ProductSearchAttribute psa " +
           "JOIN Product p ON psa.productId = p.id " +
           "WHERE p.productType.id = :productTypeId AND p.active = true AND psa.filterable = true")
    List<Object[]> findFiltersByProductTypeId(@Param("productTypeId") Long productTypeId);
    
    @Query("SELECT DISTINCT psa.attributeName, psa.attributeValue FROM ProductSearchAttribute psa " +
           "JOIN Product p ON psa.productId = p.id " +
           "WHERE p.active = true AND psa.filterable = true")
    List<Object[]> findAllAvailableFilters();
    
    @Query("SELECT psa.attributeName, psa.attributeValue, COUNT(DISTINCT p.id) FROM ProductSearchAttribute psa " +
           "JOIN Product p ON psa.productId = p.id " +
           "WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:productTypeId IS NULL OR p.productType.id = :productTypeId) " +
           "AND p.active = true AND psa.filterable = true " +
           "GROUP BY psa.attributeName, psa.attributeValue")
    List<Object[]> getFilterCounts(@Param("keyword") String keyword,
                                  @Param("categoryId") Long categoryId,
                                  @Param("productTypeId") Long productTypeId,
                                  @Param("attributes") Map<String, String> attributes);
    
    @Query("SELECT DISTINCT psa.attributeName, psa.attributeValue FROM ProductSearchAttribute psa " +
           "JOIN Product p ON psa.productId = p.id " +
           "WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:productTypeId IS NULL OR p.productType.id = :productTypeId) " +
           "AND p.active = true AND psa.filterable = true")
    List<Object[]> findFiltersForSearchContext(@Param("keyword") String keyword,
                                              @Param("categoryId") Long categoryId,
                                              @Param("productTypeId") Long productTypeId,
                                              @Param("attributes") Map<String, String> attributes);
}