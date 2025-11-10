import Image, { ImageProps } from 'next/image';
import { PLACEHOLDER_IMAGE, TINY_BLUR } from '@/lib/blur';

type OptimizedImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  fallbackSrc?: string;
};

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = PLACEHOLDER_IMAGE,
  loading = 'lazy',
  ...rest
}: OptimizedImageProps) {
  const resolvedSrc =
    (typeof src === 'string' && src.trim().length > 0 ? src : undefined) ?? fallbackSrc;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      placeholder="blur"
      blurDataURL={TINY_BLUR}
      {...rest}
    />
  );
}

