import Link from 'next/link';

export function AppLogo({ className }: { className?: string }) {
  // Base path for a single leaf, pointing upwards, height 15 units
  const baseLeafPath = "M0,0 C3,-5 4,-12 0,-15 C-4,-12 -3,-5 0,0 Z";

  return (
    <Link href="/" className={`flex items-center gap-2 text-2xl font-bold text-primary ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100" // Using a 100x100 viewBox for easier path definition
        className="h-8 w-8" // Maintains the original icon size
        aria-hidden="true" // Decorative icon
      >
        {/* Main bubble shape, fill will be text-primary color */}
        <path
          fill="currentColor"
          d="M70,10 H30 C18.954,10 10,18.954 10,30 V60 C10,71.046 18.954,80 30,80 H45 V82.5 C45,86.642 47.858,90 50,90 C52.142,90 55,86.642 55,82.5 V80 H70 C81.046,80 90,71.046 90,60 V30 C90,18.954 81.046,10 70,10 Z"
        />
        {/* Leaves - fill is white to contrast with the colored bubble */}
        {/* Central Leaf: Positioned at center, scaled to be tallest */}
        <path fill="white" d={baseLeafPath} transform="translate(50 58) scale(2.8 2.6)" />
        {/* Left Leaf: Positioned to the left, smaller, rotated */}
        <path fill="white" d={baseLeafPath} transform="translate(41 53) rotate(-35) scale(2.3 2.1)" />
        {/* Right Leaf: Positioned to the right, smaller, rotated */}
        <path fill="white" d={baseLeafPath} transform="translate(59 53) rotate(35) scale(2.3 2.1)" />
      </svg>
      <span>FARMDOCC</span>
    </Link>
  );
}
