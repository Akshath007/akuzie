import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Akuzie | Where Everything Hits Different';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Background Decoration */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '600px',
                        height: '600px',
                        background: '#7c3aed',
                        borderRadius: '50%',
                        filter: 'blur(120px)',
                        opacity: 0.2,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        right: '-10%',
                        width: '500px',
                        height: '500px',
                        background: '#2563eb',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                        opacity: 0.15,
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            fontSize: 120,
                            fontWeight: 800,
                            background: 'linear-gradient(to bottom, #ffffff, #a1a1aa)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: 0,
                            letterSpacing: '-0.05em',
                            lineHeight: 1,
                        }}
                    >
                        Akuzie
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            fontWeight: 300,
                            color: '#e4e4e7', // zinc-200
                            letterSpacing: '0.05em',
                            fontStyle: 'italic',
                            fontFamily: 'serif',
                            opacity: 0.9,
                        }}
                    >
                        Where Everything Hits Different
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        color: '#71717a', // zinc-500
                        fontSize: 16,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                    }}
                >
                    <span>Art</span>
                    <span>•</span>
                    <span>Auctions</span>
                    <span>•</span>
                    <span>Crochet</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
