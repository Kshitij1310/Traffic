const SectionTitle = ({ eyebrow, title, description }) => {
  return (
    <div className="text-center mb-12">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
