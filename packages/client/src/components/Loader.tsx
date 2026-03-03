const Loader = ({ variant }: { variant?: "full" | "inline" }) => {
  return (
    <div className={`loader-wrapper${variant === "inline" ? " loader-wrapper--inline" : ""}`}>
      <div className="loading-spinner">
        <div />
        <div />
      </div>
    </div>
  );
};

export default Loader;
