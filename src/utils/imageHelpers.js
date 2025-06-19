// src/utils/imageHelpers.js - Utilities for handling image data and database references

/**
 * Check if a string is a database image reference
 */
export const isDatabaseImageId = (imageRef) => {
  return imageRef && typeof imageRef === 'string' && imageRef.startsWith('img_');
};

/**
 * Check if a string is a data URL
 */
export const isDataUrl = (imageRef) => {
  return imageRef && typeof imageRef === 'string' && imageRef.startsWith('data:');
};

/**
 * Resolve an image reference to display data
 * This function should be used in components that display images
 */
export const resolveImageForDisplay = async (imageRef, getImageFunction) => {
  if (!imageRef) return null;
  
  // If it's already a data URL, return as-is
  if (isDataUrl(imageRef)) {
    return imageRef;
  }
  
  // If it's a database ID and we have the getter function, fetch it
  if (isDatabaseImageId(imageRef) && getImageFunction) {
    try {
      const imageData = await getImageFunction(imageRef);
      return imageData || imageRef; // Return original if fetch fails
    } catch (error) {
      console.warn('Failed to resolve image:', error);
      return null; // Return null to show fallback
    }
  }
  
  // Return as-is for other cases (like URLs)
  return imageRef;
};

/**
 * Create a wrapper component for images that automatically resolves database references
 */
import React, { useState, useEffect } from 'react';

export const DatabaseImage = ({ 
  src, 
  alt, 
  className, 
  style, 
  fallback, 
  getImageFunction,
  ...props 
}) => {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolveSrc = async () => {
      if (!src) {
        setResolvedSrc(null);
        return;
      }

      // If it's already a data URL, use it directly
      if (isDataUrl(src)) {
        setResolvedSrc(src);
        return;
      }

      // If it's a database ID, resolve it
      if (isDatabaseImageId(src) && getImageFunction) {
        setLoading(true);
        setError(false);
        
        try {
          const resolved = await resolveImageForDisplay(src, getImageFunction);
          setResolvedSrc(resolved);
        } catch (err) {
          console.warn('Failed to resolve image:', err);
          setError(true);
          setResolvedSrc(null);
        } finally {
          setLoading(false);
        }
      } else {
        // For other cases (URLs, etc.), use as-is
        setResolvedSrc(src);
      }
    };

    resolveSrc();
  }, [src, getImageFunction]);

  // Show loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-700 animate-pulse ${className}`}
        style={style}
        {...props}
      >
        <div className="text-slate-400 text-xs">Loading...</div>
      </div>
    );
  }

  // Show fallback if no resolved source or error
  if (!resolvedSrc || error) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div 
        className={`flex items-center justify-center bg-slate-700 ${className}`}
        style={style}
        {...props}
      >
        <div className="text-slate-400 text-xs">No Image</div>
      </div>
    );
  }

  // Render the actual image
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
      {...props}
    />
  );
};

/**
 * Hook for managing image resolution in components
 */
export const useImageResolver = (getImageFunction) => {
  const [imageCache, setImageCache] = useState(new Map());

  const resolveImage = async (imageRef) => {
    if (!imageRef) return null;

    // Check cache first
    if (imageCache.has(imageRef)) {
      return imageCache.get(imageRef);
    }

    try {
      const resolved = await resolveImageForDisplay(imageRef, getImageFunction);
      
      // Cache the result
      setImageCache(prev => new Map(prev).set(imageRef, resolved));
      
      return resolved;
    } catch (error) {
      console.warn('Failed to resolve image:', error);
      return null;
    }
  };

  const clearCache = () => {
    setImageCache(new Map());
  };

  return { resolveImage, clearCache };
};
