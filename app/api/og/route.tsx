/**
 * OpenGraph Image Generator
 * Dynamically generates 1200x630px OG images for blog posts
 * Uses @vercel/og with neo-brutalist design
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Dakota Smith Blog';
    const date = searchParams.get('date');

    // Format date if provided
    const formattedDate = date
      ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            backgroundColor: '#0A0A0A',
            padding: '80px',
            fontFamily: 'system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Grid background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                'linear-gradient(#333 2px, transparent 2px), linear-gradient(90deg, #333 2px, transparent 2px)',
              backgroundSize: '40px 40px',
              opacity: 0.3,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              zIndex: 1,
              width: '100%',
            }}
          >
            {/* Title with neo-brutalist border */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: '#0A0A0A',
                border: '4px solid #F5F5F5',
                padding: '40px',
                boxShadow: '8px 8px 0 0 #F5F5F5',
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 700,
                  color: '#F5F5F5',
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {title}
              </h1>

              {formattedDate && (
                <p
                  style={{
                    fontSize: '28px',
                    color: '#A9A9A9',
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {formattedDate}
                </p>
              )}
            </div>

            {/* Branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '40px',
                  backgroundColor: '#F5F5F5',
                }}
              />
              <p
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#F5F5F5',
                  margin: 0,
                }}
              >
                Dakota Smith
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating OG image:', error);
    }
    return new Response('Failed to generate image', { status: 500 });
  }
}
