package com.inventorypro.repository;

import com.inventorypro.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findBySlug(String slug);
    
    @Query("SELECT c FROM Category c WHERE c.active = true AND c.parent IS NULL ORDER BY c.sortOrder, c.name")
    List<Category> findRootCategories();
    
    @Query("SELECT c FROM Category c WHERE c.active = true AND c.parent.id = :parentId ORDER BY c.sortOrder, c.name")
    List<Category> findByParentId(Long parentId);
    
    Boolean existsBySlug(String slug);
}