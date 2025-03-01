function TermsSection({ title, children }) {
  return (
    <div className="bg-white p-8 mb-2">
      <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-green-700 mb-4">
        {title}
      </h2>
      <div className="text-sm sm:text-base lg:text-lg text-gray-900 space-y-4">
        {children}
      </div>
    </div>
  );
}

export default TermsSection;

