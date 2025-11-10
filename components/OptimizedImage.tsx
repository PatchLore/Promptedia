import Image, { ImageProps } from 'next/image';
import { PLACEHOLDER_IMAGE, TINY_BLUR } from '@/lib/blur';

type OptimizedImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  fallbackSrc?: string;
};

function applyTransforms(original: string): string {
  if (!original || original.startsWith('data:')) {
    return original;
  }

  try {
    const url = new URL(original);
    url.searchParams.set('w', url.searchParams.get('w') ?? '400');
    url.searchParams.set('q', '70');
    url.searchParams.set('auto', url.searchParams.get('auto') ?? 'format');
    return url.toString();
  } catch {
    const hasQuery = original.includes('?');
    const suffix = 'w=400&q=70&auto=format';
    return `${original}${hasQuery ? '&' : '?'}${suffix}`;
  }
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = PLACEHOLDER_IMAGE,
  loading = 'lazy',
  ...rest
}: OptimizedImageProps) {
  const providedSrc =
    typeof src === 'string' && src.trim().length > 0 ? applyTransforms(src) : undefined;
  const resolvedSrc = providedSrc ?? fallbackSrc;

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

