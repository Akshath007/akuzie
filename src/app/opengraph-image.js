import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Akuzie | Handmade Acrylic Paintings';
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
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #e5e7eb 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e5e7eb 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        opacity: 0.3,
                    }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    {/* Logo or Icon Representation */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '40px',
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif'
                    }}>
                        A
                    </div>
                </div>
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 'bold',
                        color: 'black',
                        marginBottom: 20,
                        letterSpacing: '-2px',
                    }}
                >
                    Akuzie
                </div>
                <div
                    style={{
                        fontSize: 32,
                        color: '#52525b',
                        maxWidth: '80%',
                        textAlign: 'center',
                        lineHeight: 1.4,
                    }}
                >
                    Exclusive Handmade Creations & Art
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
