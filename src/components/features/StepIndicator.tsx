import { CheckCircle2 } from "lucide-react";

const StepIndicator = ({ step }) => {
  return (
    <div className="flex justify-between items-center mb-10">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex flex-col items-center flex-1 relative">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${s === step
                ? "bg-primary text-white scale-110"
                : s < step
                  ? "bg-green-100 text-primary"
                  : "bg-gray-200 text-gray-500"
              }`}
            style={{ zIndex: 10 }}
          >
            {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
          </div>
          <span
            className={`text-xs mt-2 ${s === step ? "font-semibold text-primary" : "text-gray-500"
              }`}
          >
            {s === 1 && "Information"}
            {s === 2 && "Details"}
            {s === 3 && "Publishing"}
          </span>
          {s < 3 && (
            <div
              className={`h-1 absolute top-4 left-1/2 right-0 -z-0 transform -translate-y-1/2 transition-all duration-300 ${s < step ? "bg-primary" : "bg-gray-200"
                }`}
              style={{
                width: "calc(100% - 2rem)",
                left: "calc(50% + 1rem)",
                marginRight: "1rem",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
