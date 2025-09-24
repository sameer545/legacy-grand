// components/LazyImage.jsx
import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwQzE0LjQ3NzIgMTAgMTAgMTQuNDc3MiAxMCAyMEMxMCAyNS41MjI4IDE0LjQ3NzIgMzAgMjAgMzBDMjUuNTIyOCAzMCAzMCAyNS41MjI4IDMwIDIwQzMwIDE0LjQ3NzIgMjUuNTIyOCAxMCAyMCAxMFoiIGZpbGw9IiNEREQiLz4KPC9zdmc+',
  errorSrc = '/images/image-error.svg',
  threshold = 0.1,
  quality = 75,
  formats = ['webp', 'jpg'],
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate responsive image sources with different formats
  const generateSrcSet = (baseSrc, formats) => {
    if (!baseSrc || hasError) return '';
    
    return formats.map(format => {
      const extension = format === 'webp' ? 'webp' : 'jpg';
      const optimizedSrc = baseSrc.includes('cloudinary.com') 
        ? baseSrc.replace(/\.(jpg|jpeg|png)/, `.${extension}?q=${quality}&f=${format}`)
        : baseSrc;
      return `${optimizedSrc} 1x`;
    }).join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, threshold]);

  // Load image when in view
  useEffect(() => {
    if (isInView && !isLoaded && !hasError && src) {
      const img = new Image();
      
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        setHasError(true);
        setCurrentSrc(errorSrc);
        if (onError) onError();
      };
      
      img.src = src;
    }
  }, [isInView, isLoaded, hasError, src, errorSrc, onLoad, onError]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setHasError(true);
    setCurrentSrc(errorSrc);
    if (onError) onError();
  };

  const imageClasses = `
    ${className}
    transition-all duration-500 ease-in-out
    ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    ${hasError ? 'filter grayscale opacity-50' : ''}
  `.trim();

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${isLoaded ? '' : 'animate-pulse bg-gray-300'}`}
      style={{ backgroundColor: isLoaded ? 'transparent' : '#f3f4f6' }}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Progressive enhancement with picture element for better format support */}
      <picture>
        {/* WebP format for modern browsers */}
        {isInView && !hasError && formats.includes('webp') && (
          <source
            srcSet={generateSrcSet(src, ['webp'])}
            type="image/webp"
            sizes={sizes}
          />
        )}
        
        {/* Fallback to JPEG/PNG */}
        <img
          src={isInView ? currentSrc : placeholderSrc}
          alt={alt}
          className={imageClasses}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes={sizes}
          {...props}
        />
      </picture>

      {/* Error state overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span>Failed to load image</span>
        </div>
      )}

      {/* SEO enhancement - structured data for images */}
      {isLoaded && !hasError && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "url": src,
            "description": alt,
            "encodingFormat": src?.split('.').pop()?.toUpperCase()
          })}
        </script>
      )}
    </div>
  );
};

// Higher-order component for bulk lazy loading
export const withLazyLoading = (Component) => {
  return React.forwardRef((props, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const componentRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      );

      if (componentRef.current) {
        observer.observe(componentRef.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={componentRef}>
        {isVisible ? (
          <Component {...props} ref={ref} />
        ) : (
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
        )}
      </div>
    );
  });
};

// Utility function to preload critical images
export const preloadImages = (imageSrcs) => {
  if (typeof window === 'undefined') return;

  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Custom hook for image optimization
export const useImageOptimization = () => {
  const optimizeImageUrl = (url, options = {}) => {
    const {
      width,
      height,
      quality = 75,
      format = 'auto',
      fit = 'cover'
    } = options;

    if (!url) return '';

    // Cloudinary optimization
    if (url.includes('cloudinary.com')) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`);
      transformations.push(`f_${format}`);
      transformations.push(`c_${fit}`);
      
      return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }

    // Add other CDN optimizations here (ImageKit, etc.)
    return url;
  };

  const generateResponsiveSizes = (breakpoints = {
    mobile: 640,
    tablet: 1024,
    desktop: 1280
  }) => {
    return Object.entries(breakpoints)
      .map(([device, width]) => `(max-width: ${width}px) 100vw`)
      .join(', ') + ', 100vw';
  };

  return {
    optimizeImageUrl,
    generateResponsiveSizes
  };
};

export default LazyImage;