export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <div
      className={`${className} flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3cb5ff] via-max-500 to-[#a24bf2] font-black text-white shadow-md`}
    >
      <span className="text-[0.95em] leading-none">M</span>
    </div>
  )
}
