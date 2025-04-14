function TermsSection({ title, children }) {
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 mb-4 rounded-lg shadow-sm">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 mb-3 md:mb-4">
        {title}
      </h2>
      <div className="text-sm sm:text-base text-gray-900 space-y-3 md:space-y-4">
        {children}
      </div>
    </div>
  );
}

export default TermsSection;

