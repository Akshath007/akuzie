export default function Input({ label, ...props }) {
    return (
        <div className="space-y-2">
            {label && <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1">{label}</label>}
            <input
                className="w-full bg-white border border-gray-200 rounded-none px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200"
                {...props}
            />
        </div>
    );
}
