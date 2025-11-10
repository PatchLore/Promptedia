import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = decodeURIComponent(searchParams.get('title') || 'AI Prompt');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: 'white',
          fontSize: 64,
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1000px' }}>{title}</div>
      </div>
    ),
    size
  );
}
