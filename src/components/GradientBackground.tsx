export default function GradientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
          `,
          animation: 'gradientShift 20s ease infinite',
        }}
      />

      {/* Unsplash space image - royalty free */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)',
          animation: 'slowZoom 60s ease-in-out infinite alternate',
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1) rotate(5deg);
          }
        }

        @keyframes slowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
