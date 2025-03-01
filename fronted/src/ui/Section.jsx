import React from "react";

function Section({ title, subtitle, children }) {
    return (
      <div>
        <div className="max-w-xl mx-auto my-10 px-6 sm:px-8">
          <div className="text-left mb-6">
            {subtitle && (
              <p className="rounded-full text-green-800 text-sm font-semibold">
                {subtitle}
              </p>
            )}
            {title && <h2 className="text-2xl md:text-3xl text-[#0A690E] font-bold mt-4">{title}</h2>}
          </div>
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    );
  }
  
  export default Section;