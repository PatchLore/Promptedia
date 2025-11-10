import Image, { ImageProps } from 'next/image';
import { PLACEHOLDER_IMAGE, TINY_BLUR } from '@/lib/blur';

type OptimizedImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  fallbackSrc?: string;
  mode?: 'card' | 'hero' | 'og';
};

function applyTransforms(original: string, mode: OptimizedImageProps['mode'] = 'card'): string {
  if (!original || original.startsWith('data:')) {
    return original;
  }

  const width = mode === 'hero' ? '1600' : mode === 'og' ? '1200' : '400';
  const height = mode === 'og' ? '630' : undefined;

  try {
    const url = new URL(original);
    if (!url.searchParams.has('w')) url.searchParams.set('w', width);
    if (height && !url.searchParams.has('h')) url.searchParams.set('h', height);
    url.searchParams.set('q', url.searchParams.get('q') ?? '70');
    url.searchParams.set('auto', url.searchParams.get('auto') ?? 'format');
    return url.toString();
  } catch {
    const params = new URLSearchParams();
    params.set('w', width);
    if (height) params.set('h', height);
    params.set('q', '70');
    params.set('auto', 'format');
    return `${original}${original.includes('?') ? '&' : '?'}${params.toString()}`;
  }
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = PLACEHOLDER_IMAGE,
  loading = 'lazy',
  mode = 'card',
  ...rest
}: OptimizedImageProps) {
  const providedSrc =
    typeof src === 'string' && src.trim().length > 0 ? applyTransforms(src, mode) : undefined;
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

